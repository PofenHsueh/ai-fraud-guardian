import { CloseOutlined, FileTextOutlined, LinkOutlined } from '@ant-design/icons'
import { Button, Empty, Flex, Image, Typography } from 'antd'
import { formatFileSize } from '@/features/evidence/utils/rules'
import type { EvidenceItem } from '@/types/evidence'
import styles from './EvidenceList.module.css'

type Props = {
  items: EvidenceItem[]
  onRemove: (id: string) => void
}

// 預覽失敗（例如部分瀏覽器無法顯示 HEIC）時改顯示的灰色圖示
const PREVIEW_FALLBACK =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48"><rect width="48" height="48" fill="%23f5f5f5"/><path d="M14 32l7-9 5 6 4-4 4 7z" fill="%23bfbfbf"/></svg>'

const itemLabel = (item: EvidenceItem): { title: string; meta: string } => {
  switch (item.type) {
    case 'image':
      return { title: item.fileName, meta: `截圖．${formatFileSize(item.sizeBytes)}` }
    case 'url':
      return { title: item.value, meta: '網址連結' }
    case 'text':
      return { title: item.value, meta: '文字' }
  }
}

const ItemIcon = ({ item }: { item: EvidenceItem }) => {
  if (item.type === 'image') {
    return (
      <Image
        src={item.previewUrl}
        alt={item.fileName}
        fallback={PREVIEW_FALLBACK}
        classNames={{ image: styles.thumb }}
        width={48}
        height={48}
      />
    )
  }
  return <span className={styles.icon}>{item.type === 'url' ? <LinkOutlined /> : <FileTextOutlined />}</span>
}

export const EvidenceList = ({ items, onRemove }: Props) => {
  return (
    <>
      <Typography.Text strong>已新增 {items.length} 筆</Typography.Text>
      {items.length === 0 ? (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="可新增截圖、網址或文字摘要，可混合多筆" />
      ) : (
        <ul className={styles.list}>
          {items.map((item) => {
            const { title, meta } = itemLabel(item)
            return (
              <li key={item.id} className={styles.row}>
                <ItemIcon item={item} />
                {/* 一律以純文字顯示，網址不做成連結，避免誤開可疑網站 */}
                <Flex vertical className={styles.content}>
                  <Typography.Text ellipsis>{title}</Typography.Text>
                  <Typography.Text type="secondary">{meta}</Typography.Text>
                </Flex>
                <Button
                  type="text"
                  icon={<CloseOutlined />}
                  aria-label={`刪除 ${title}`}
                  onClick={() => onRemove(item.id)}
                />
              </li>
            )
          })}
        </ul>
      )}
    </>
  )
}
