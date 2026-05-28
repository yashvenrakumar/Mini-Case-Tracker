import { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  Paper,
  Divider,
  Stack,
  IconButton,
} from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import { formatRelative } from '@/utils/format';
import type { Comment } from '@/types';

interface CommentsSectionProps {
  comments: Comment[];
  currentUserId?: string;
  onAdd: (body: string) => Promise<void>;
  onUpdate?: (commentId: string, body: string) => Promise<void>;
  onDelete?: (commentId: string) => Promise<void>;
  disabled?: boolean;
}

export const CommentsSection = ({
  comments,
  currentUserId,
  onAdd,
  onUpdate,
  onDelete,
  disabled,
}: CommentsSectionProps) => {
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editBody, setEditBody] = useState('');
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const canModifyOwn = !disabled && Boolean(currentUserId);

  const isOwnComment = (comment: Comment) =>
    Boolean(currentUserId && String(comment.author._id) === String(currentUserId));

  const handleSubmit = async () => {
    if (!body.trim()) return;
    setLoading(true);
    try {
      await onAdd(body.trim());
      setBody('');
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (comment: Comment) => {
    setEditingId(comment._id);
    setEditBody(comment.body);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditBody('');
  };

  const handleSaveEdit = async (commentId: string) => {
    if (!onUpdate || !editBody.trim()) return;
    setSavingId(commentId);
    try {
      await onUpdate(commentId, editBody.trim());
      cancelEdit();
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (comment: Comment) => {
    if (!onDelete) return;
    const confirmed = window.confirm('Delete this comment? This cannot be undone.');
    if (!confirmed) return;
    setDeletingId(comment._id);
    try {
      await onDelete(comment._id);
      if (editingId === comment._id) cancelEdit();
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ fontWeight: 600 }} className="mb-2">
        Comments & Notes
      </Typography>
      {!disabled && (
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1.5}
          sx={{ mb: 3, alignItems: { xs: 'stretch', sm: 'flex-end' } }}
        >
          <TextField
            fullWidth
            multiline
            minRows={2}
            placeholder="Add a note..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
            size="small"
          />
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading || !body.trim()}
            sx={{
              flexShrink: 0,
              width: { xs: '100%', sm: 'auto' },
              minWidth: { sm: 88 },
            }}
          >
            Add
          </Button>
        </Stack>
      )}
      <List component={Paper} variant="outlined" disablePadding>
        {comments.length === 0 ? (
          <ListItem>
            <ListItemText secondary="No comments yet" />
          </ListItem>
        ) : (
          comments.map((c, i) => {
            const isEditing = editingId === c._id;
            const showActions =
              canModifyOwn && isOwnComment(c) && onUpdate && onDelete;

            return (
              <Box key={c._id}>
                {i > 0 && <Divider />}
                <ListItem
                  alignItems="flex-start"
                  sx={{ py: 1.5 }}
                  secondaryAction={
                    showActions && !isEditing ? (
                      <Stack direction="row" spacing={0.5}>
                        <IconButton
                          size="small"
                          aria-label="Edit comment"
                          onClick={() => startEdit(c)}
                          disabled={deletingId === c._id}
                        >
                          <EditOutlinedIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          aria-label="Delete comment"
                          color="error"
                          onClick={() => handleDelete(c)}
                          disabled={deletingId === c._id}
                        >
                          <DeleteOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    ) : undefined
                  }
                >
                  {isEditing ? (
                    <Box sx={{ width: '100%', pr: { xs: 0, sm: 8 } }}>
                      <TextField
                        fullWidth
                        multiline
                        minRows={2}
                        value={editBody}
                        onChange={(e) => setEditBody(e.target.value)}
                        size="small"
                        sx={{ mb: 1.5 }}
                      />
                      <Stack direction="row" spacing={1}>
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() => handleSaveEdit(c._id)}
                          disabled={savingId === c._id || !editBody.trim()}
                        >
                          Save
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={cancelEdit}
                          disabled={savingId === c._id}
                        >
                          Cancel
                        </Button>
                      </Stack>
                    </Box>
                  ) : (
                    <ListItemText
                      primary={c.body}
                      secondary={`${c.author.name} · ${formatRelative(c.createdAt)}`}
                      slotProps={{
                        primary: { sx: { wordBreak: 'break-word', pr: showActions ? 6 : 0 } },
                      }}
                    />
                  )}
                </ListItem>
              </Box>
            );
          })
        )}
      </List>
    </Box>
  );
};
