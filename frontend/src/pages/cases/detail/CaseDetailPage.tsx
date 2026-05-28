import { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Divider,
  IconButton,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import {
  useCasesApi,
  useCommentsApi,
  useDocumentsApi,
  useUsersApi,
} from '@/hooks/api';
import { useAppSelector } from '@/redux/hooks';
import { selectAuthUser } from '@/redux/slices/authSlice';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { StatusChip } from '@/components/common/StatusChip';
import { StatusTimeline } from './components/StatusTimeline';
import { CommentsSection } from './components/CommentsSection';
import { DocumentsSection } from './components/DocumentsSection';
import { StatusActions } from './components/StatusActions';
import { ROUTES, USER_ROLES } from '@/constants';
import { formatDate } from '@/utils/format';
import { isCaseClosed } from '@/utils/statusHelpers';
import type { CaseDetailResponse, Comment, CaseDocument, AgentOption } from '@/types';
import type { CaseStatus } from '@/types';
import { getApiErrorMessage } from '@/utils/apiClient';
import toast from 'react-hot-toast';

export const CaseDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useAppSelector(selectAuthUser);
  const { getCase, updateStatus, assignCase, updateCase, deleteCase } =
    useCasesApi();
  const { listComments, addComment, updateComment, deleteComment } = useCommentsApi();
  const { listDocuments, uploadDocument, deleteDocument } = useDocumentsApi();
  const { listAgents } = useUsersApi();

  const [detail, setDetail] = useState<CaseDetailResponse | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [documents, setDocuments] = useState<CaseDocument[]>([]);
  const [agents, setAgents] = useState<AgentOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editValues, setEditValues] = useState({
    clientName: '',
    subjectName: '',
    caseType: '',
    dueDate: '',
  });

  
 
  const loadAll = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [caseDetail, commentsList, docsList] = await Promise.all([
        getCase(id),
        listComments(id),
        listDocuments(id),
      ]);
      setDetail(caseDetail);
      setComments(commentsList);
      setDocuments(docsList);
      console.log("caseDetail-------", caseDetail);
      console.log("  commentsList===--", commentsList);
      console.log("docsList=  ", docsList);
      if (user?.role === USER_ROLES.MANAGER) {
        const agentList = await listAgents();
        setAgents(agentList);
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err));
      navigate(ROUTES.CASES);
    } finally {
      setLoading(false);
    }
  }, [id, getCase, listComments, listDocuments, listAgents, user, navigate]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const handleStatus = async (status: CaseStatus) => {
    if (!id) return;
    await updateStatus(id, { status });
    toast.success('Status updated');
    loadAll();
  };

  const handleAssign = async (assignedTo: string) => {
    if (!id) return;
    await assignCase(id, { assignedTo });
    toast.success('Case assigned');
    loadAll();
  };

  const handleComment = async (body: string) => {
    if (!id) return;
    await addComment(id, body);
    toast.success('Comment added');
    const updated = await listComments(id);
    setComments(updated);
    loadAll();
  };

  const handleUpdateComment = async (commentId: string, body: string) => {
    if (!id) return;
    await updateComment(id, commentId, body);
    toast.success('Comment updated');
    const updated = await listComments(id);
    setComments(updated);
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!id) return;
    await deleteComment(id, commentId);
    toast.success('Comment deleted');
    const updated = await listComments(id);
    setComments(updated);
    loadAll();
  };

  const handleUpload = async (file: File) => {
    if (!id) return;
    await uploadDocument(id, file);
    toast.success('Document uploaded');
    const updated = await listDocuments(id);
    setDocuments(updated);
    loadAll();
  };

  const handleDeleteDocument = async (docId: string) => {
    if (!id) return;
    await deleteDocument(id, docId);
    toast.success('Document deleted');
    const updated = await listDocuments(id);
    setDocuments(updated);
    loadAll();
  };

  if (loading || !detail) return <LoadingSpinner fullScreen />;

  const { case: caseRecord, timeline } = detail;
  const closed = isCaseClosed(caseRecord.status);
  const isManager = user?.role === USER_ROLES.MANAGER;
  const isAssignedAgent =
    user?.role === USER_ROLES.AGENT &&
    String(caseRecord.assignedTo?._id) === String(user.id);

  const openEdit = () => {
    const d = new Date(caseRecord.dueDate);
    const dueDateValue = Number.isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10);
    setEditValues({
      clientName: caseRecord.clientName ?? '',
      subjectName: caseRecord.subjectName ?? '',
      caseType: caseRecord.caseType ?? '',
      dueDate: dueDateValue,
    });
    setEditOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!id) return;
    setSaving(true);
    try {
      await updateCase(id, {
        clientName: editValues.clientName,
        subjectName: editValues.subjectName,
        caseType: editValues.caseType,
        dueDate: editValues.dueDate,
      });
      toast.success('Case updated');
      setEditOpen(false);
      loadAll();
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCase = async () => {
    if (!id) return;
    setDeleting(true);
    try {
      await deleteCase(id);
      toast.success('Case deleted');
      navigate(ROUTES.CASES);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setDeleting(false);
      setDeleteOpen(false);
    }
  };

  return (
    <Box sx={{ width: '100%', minWidth: 0 }}>
      <Box
        sx={{
          mb: 4,
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: 2,
        }}
      >
        <IconButton
          onClick={() => navigate(ROUTES.CASES)}
          aria-label="Back to cases"
          sx={{ alignSelf: { xs: 'flex-start', sm: 'center' } }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              wordBreak: 'break-word',
            }}
          >
            {caseRecord.clientName}
          </Typography>
          <Typography color="text.secondary" sx={{ wordBreak: 'break-word' }}>
            {caseRecord.subjectName} · {caseRecord.caseType}
          </Typography>
        </Box>
        <Box sx={{ flexShrink: 0, alignSelf: { xs: 'flex-start', sm: 'center' } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <StatusChip status={caseRecord.status} size="medium" />
            {isManager && (
              <>
                <Button variant="outlined" size="small" onClick={openEdit}>
                  Edit
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  onClick={() => setDeleteOpen(true)}
                >
                  Delete
                </Button>
              </>
            )}
          </Box>
        </Box>
      </Box>

      <Paper
        className="mb-4"
        elevation={1}
        sx={{ p: { xs: 2, sm: 3, md: 4 }, overflow: 'hidden' }}
      >
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Typography variant="caption" color="text.secondary">
              Due Date
            </Typography>
            <Typography>{formatDate(caseRecord.dueDate)}</Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Typography variant="caption" color="text.secondary">
              Assigned To
            </Typography>
            <Typography>{caseRecord.assignedTo?.name ?? 'Unassigned'}</Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Typography variant="caption" color="text.secondary">
              Created By
            </Typography>
            <Typography>{caseRecord.createdBy?.name ?? '—'}</Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Typography variant="caption" color="text.secondary">
              Documents / Comments
            </Typography>
            <Typography>
              {detail.counts.documents} docs · {detail.counts.comments} comments
            </Typography>
          </Grid>
        </Grid>
        <Divider className="my-4" />
        <div className="py-4">
          <StatusActions
            caseRecord={caseRecord}
            userRole={user!.role}
            onUpdateStatus={handleStatus}
            onAssign={user?.role === USER_ROLES.MANAGER ? handleAssign : undefined}
            agents={agents}
          />
        </div>
      </Paper>

      <Dialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Edit case</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Client name"
              value={editValues.clientName}
              onChange={(e) =>
                setEditValues((v) => ({ ...v, clientName: e.target.value }))
              }
              fullWidth
            />
            <TextField
              label="Subject name"
              value={editValues.subjectName}
              onChange={(e) =>
                setEditValues((v) => ({ ...v, subjectName: e.target.value }))
              }
              fullWidth
            />
            <TextField
              label="Case type"
              value={editValues.caseType}
              onChange={(e) =>
                setEditValues((v) => ({ ...v, caseType: e.target.value }))
              }
              fullWidth
            />
            <TextField
              label="Due date"
              type="date"
              value={editValues.dueDate}
              onChange={(e) =>
                setEditValues((v) => ({ ...v, dueDate: e.target.value }))
              }
              slotProps={{ inputLabel: { shrink: true } }}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)} disabled={saving}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSaveEdit} disabled={saving}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Delete case?</DialogTitle>
        <DialogContent>
          <Typography color="text.secondary">
            This will permanently delete the case and its documents/comments.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteOpen(false)} disabled={deleting}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteCase}
            disabled={deleting}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper elevation={1} sx={{ p: { xs: 2, sm: 3, md: 4 }, mb: { xs: 2, md: 3 } }}>
            <StatusTimeline entries={timeline} />
          </Paper>
          <Paper elevation={1} sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
            <CommentsSection
              comments={comments}
              currentUserId={user?.id}
              onAdd={handleComment}
              onUpdate={handleUpdateComment}
              onDelete={handleDeleteComment}
              disabled={closed}
            />
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper elevation={1} sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
            <DocumentsSection
              documents={documents}
              onUpload={handleUpload}
              onDelete={handleDeleteDocument}
              canUpload={isAssignedAgent && !closed}
              canDelete={isAssignedAgent && !closed}
            />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};
