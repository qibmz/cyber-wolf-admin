import { PlusOutlined } from '@ant-design/icons';
import { App, Image, Input, Upload } from 'antd';
import type { UploadFile, UploadProps } from 'antd/es/upload/interface';
import React, { useEffect, useRef, useState } from 'react';
import { filesS3ControllerUploadFileV1 } from '@/services/cyber-wolf/files';

const DEFAULT_MAX_SIZE_MB = 5;

export type ImageUploadProps = {
  /** 表单值：图片 URL / 上传后的 path */
  value?: string;
  onChange?: (value?: string) => void;
  /** 上传成功时额外回调完整 FileType（如需存 id） */
  onUploaded?: (file: API.FileType) => void;
  accept?: string;
  maxSizeMB?: number;
  disabled?: boolean;
  /** 是否展示「粘贴 URL」输入框，默认 true */
  showUrlInput?: boolean;
};

function toFileList(url?: string): UploadFile[] {
  if (!url) return [];
  return [
    {
      uid: '-1',
      name: 'image',
      status: 'done',
      url,
    },
  ];
}

function getFileDisplayUrl(file?: UploadFile): string | undefined {
  if (!file) return undefined;
  const fromResponse =
    typeof file.response === 'object' &&
    file.response &&
    'path' in file.response
      ? String((file.response as { path?: string }).path ?? '')
      : '';
  return file.url || file.thumbUrl || fromResponse || undefined;
}

/**
 * 公共图片上传：走 POST /api/v1/files/upload，表单值存 path/URL 字符串。
 * 预览使用 antd Image 弹层（非新开网页）。
 */
const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  onUploaded,
  accept = 'image/*',
  maxSizeMB = DEFAULT_MAX_SIZE_MB,
  disabled,
  showUrlInput = true,
}) => {
  const { message } = App.useApp();
  const blobUrlRef = useRef<string | undefined>(undefined);
  const [fileList, setFileList] = useState<UploadFile[]>(() =>
    toFileList(value),
  );
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');

  const revokeBlobUrl = () => {
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = undefined;
    }
  };

  useEffect(() => {
    setFileList((prev) => {
      const current = prev[0];
      const currentDisplay = getFileDisplayUrl(current);
      const responsePath =
        typeof current?.response === 'object' &&
        current?.response &&
        'path' in current.response
          ? String((current.response as { path?: string }).path ?? '')
          : undefined;

      // 同一张图：保留本地 blob 预览（远端 CDN 可能暂不可访问）
      if (
        value &&
        responsePath === value &&
        currentDisplay?.startsWith('blob:')
      ) {
        return prev;
      }
      if (currentDisplay === value) return prev;

      revokeBlobUrl();
      return toFileList(value);
    });
  }, [value]);

  useEffect(() => () => revokeBlobUrl(), []);

  const beforeUpload: UploadProps['beforeUpload'] = (file) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('只能上传图片文件');
      return Upload.LIST_IGNORE;
    }
    const tooLarge = file.size / 1024 / 1024 > maxSizeMB;
    if (tooLarge) {
      message.error(`图片需小于 ${maxSizeMB}MB`);
      return Upload.LIST_IGNORE;
    }
    return true;
  };

  const customRequest: UploadProps['customRequest'] = async (options) => {
    const { file, onSuccess, onError } = options;
    try {
      const result = await filesS3ControllerUploadFileV1({}, file as File);
      const uploaded = result?.file;
      if (!uploaded?.path) {
        throw new Error('上传响应缺少文件 path');
      }

      revokeBlobUrl();
      const localPreview = URL.createObjectURL(file as File);
      blobUrlRef.current = localPreview;

      const nextFile: UploadFile = {
        uid: uploaded.id || `${Date.now()}`,
        name: (file as File).name || 'image',
        status: 'done',
        // 缩略图 / 预览优先用本地 blob，避免刚上传后 CDN 403 导致看不到图
        url: localPreview,
        response: uploaded,
      };
      setFileList([nextFile]);
      onChange?.(uploaded.path);
      onUploaded?.(uploaded);
      onSuccess?.(uploaded);
      message.success('上传成功');
    } catch (error) {
      onError?.(error as Error);
      message.error('上传失败，请重试');
    }
  };

  const handlePreview: UploadProps['onPreview'] = (file) => {
    const url = getFileDisplayUrl(file);
    if (!url) {
      message.warning('暂无可预览的图片');
      return;
    }
    setPreviewImage(url);
    setPreviewOpen(true);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        width: '100%',
        minWidth: 0,
        alignSelf: 'stretch',
      }}
    >
      <Upload
        accept={accept}
        listType="picture-card"
        maxCount={1}
        disabled={disabled}
        fileList={fileList}
        beforeUpload={beforeUpload}
        customRequest={customRequest}
        onPreview={handlePreview}
        onChange={({ fileList: next }) => {
          const uploading = next.some((f) => f.status === 'uploading');
          if (uploading) {
            setFileList(next);
            return;
          }
          if (next.length === 0) {
            revokeBlobUrl();
            setFileList([]);
            onChange?.(undefined);
          }
        }}
      >
        {fileList.length >= 1 ? null : (
          <button
            type="button"
            style={{
              border: 0,
              background: 'none',
              cursor: 'pointer',
            }}
          >
            <PlusOutlined />
            <div style={{ marginTop: 8 }}>上传</div>
          </button>
        )}
      </Upload>

      {previewImage ? (
        <Image
          alt="preview"
          wrapperStyle={{ display: 'none' }}
          src={previewImage}
          preview={{
            open: previewOpen,
            onOpenChange: (open) => {
              setPreviewOpen(open);
              if (!open) setPreviewImage('');
            },
          }}
        />
      ) : null}

      {showUrlInput ? (
        <Input
          allowClear
          disabled={disabled}
          placeholder="或粘贴图片 URL"
          value={value}
          style={{ width: '100%' }}
          onChange={(e) => {
            const next = e.target.value.trim() || undefined;
            onChange?.(next);
          }}
        />
      ) : null}
    </div>
  );
};

export default ImageUpload;
