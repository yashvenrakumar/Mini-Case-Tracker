import { useRef, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  Paper,
  Divider,
  IconButton,
  Link,
  Stack,
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import { UPLOAD_BASE_URL } from '@/constants';
import { formatRelative } from '@/utils/format';
import type { CaseDocument } from '@/types';

interface DocumentsSectionProps {
  documents: CaseDocument[];
  onUpload: (file: File) => Promise<void>;
  onDelete?: (docId: string) => Promise<void>;
  canUpload?: boolean;
  canDelete?: boolean;
}

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const DocumentsSection = ({
  documents,
  onUpload,
  onDelete,
  canUpload,
  canDelete,
}: DocumentsSectionProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await onUpload(file);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const handleDelete = async (doc: CaseDocument) => {
    if (!onDelete) return;
    const confirmed = window.confirm(
      `Delete "${doc.originalName}"? This cannot be undone.`
    );
    if (!confirmed) return;
    setDeletingId(doc._id);
    try {
      await onDelete(doc._id);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ fontWeight: 600 }} className="mb-2">
        Documents
      </Typography>
      {canUpload && (
        <Stack direction="row" spacing={1.5} sx={{ mb: 3 }}>
          <input
            ref={inputRef}
            type="file"
            hidden
            accept="image/jpeg,image/png,image/gif,image/webp,application/pdf,.doc,.docx,text/plain"
            onChange={handleFileChange}
          />
          <Button
            variant="contained"
            startIcon={<UploadFileIcon />}
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? 'Uploading…' : 'Upload document'}
          </Button>
        </Stack>
      )}
      <List component={Paper} variant="outlined" disablePadding>
        {documents.length === 0 ? (
          <ListItem>
            <ListItemText secondary="No documents yet" />
          </ListItem>
        ) : (
          documents.map((doc, i) => (
            <Box key={doc._id}>
              {i > 0 && <Divider />}
              <ListItem
                alignItems="flex-start"
                sx={{ py: 1.5 }}
                secondaryAction={
                  canDelete && onDelete ? (
                    <IconButton
                      edge="end"
                      aria-label={`Delete ${doc.originalName}`}
                      onClick={() => handleDelete(doc)}
                      disabled={deletingId === doc._id}
                      color="error"
                      size="small"
                    >
                      <DeleteOutlinedIcon />
                    </IconButton>
                  ) : undefined
                }
              >
                <ListItemText
                  primary={
                    <Link
                      href={`${UPLOAD_BASE_URL}/uploads/${doc.filename}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      underline="hover"
                    >
                      {doc.originalName}
                    </Link>
                  }
                  secondary={`${doc.uploadedBy.name} · ${formatFileSize(doc.size)} · ${formatRelative(doc.createdAt)}`}
                  slotProps={{
                    primary: { sx: { wordBreak: 'break-word' } },
                  }}
                />
              </ListItem>
            </Box>
          ))
        )}
      </List>
    </Box>
  );
};
