import { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  AppBar,
  Box,
  Container,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import DashboardIcon from "@mui/icons-material/Dashboard";
import FolderIcon from "@mui/icons-material/Folder";
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import LogoutIcon from "@mui/icons-material/Logout";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { logout, selectAuthUser } from "@/redux/slices/authSlice";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { ROUTES, USER_ROLES } from "@/constants";
import toast from "react-hot-toast";

const DRAWER_WIDTH = 260;

export const MainLayout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectAuthUser);

  console.log("User --------  in main layout  ", user);

  const navItems = [
    { label: "Dashboard", path: ROUTES.DASHBOARD, icon: <DashboardIcon /> },
    { label: "Cases", path: ROUTES.CASES, icon: <FolderIcon /> },
    ...(user?.role === USER_ROLES.MANAGER
      ? [
          {
            label: "New Case",
            path: ROUTES.CASE_CREATE,
            icon: <AddCircleOutlineOutlinedIcon />,
          },
        ]
      : []),
  ];

  const handleLogout = () => {
    dispatch(logout());
    toast.success("Logged out successfully");
    navigate(ROUTES.LOGIN);
  };

  const drawer = (
    <Box className="flex h-full flex-col">
      <Box className="p-4">
        <Typography variant="h6" color="primary" sx={{ fontWeight: 700 }}>
          Case Tracker
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {user?.role === USER_ROLES.MANAGER ? "Manager" : "Agent"} portal
        </Typography>
      </Box>
      <Divider />
      <List className="flex-1 px-2 py-2">
        {navItems.map((item) => (
          <ListItemButton
            key={item.path}
            selected={location.pathname.startsWith(item.path)}
            onClick={() => {
              navigate(item.path);
              setMobileOpen(false);
            }}
            className="mb-1"
          >
            <ListItemIcon sx={{ color: "text.secondary" }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );

  return (
    <Box
      className="flex min-h-screen"
      sx={{ bgcolor: "background.default", color: "text.primary" }}
    >
      <AppBar position="fixed" color="inherit" elevation={0}>
        <Toolbar
          sx={{
            px: { xs: 1, sm: 2 },
            minHeight: { xs: 56, sm: 64 },
          }}
        >
          {isMobile && (
            <IconButton
              edge="start"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Open menu"
              size="medium"
              sx={{ mr: 1 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography
            variant="h6"
            component="span"
            className="font-semibold"
            sx={{
              flex: 1,
              minWidth: 0,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              fontSize: { xs: "0.95rem", sm: "1.15rem", md: "1.25rem" },
            }}
          >
            Verifacts
          </Typography>
          <ThemeToggle size="small" />
          <IconButton
            onClick={(e) => setAnchorEl(e.currentTarget)}
            sx={{ ml: 0.5 }}
            aria-label="Account menu"
          >
            <Avatar sx={{ width: 36, height: 36, bgcolor: "primary.main" }}>
              {user?.name?.charAt(0) ?? "U"}
            </Avatar>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
          >
            <MenuItem disabled>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {user?.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {user?.email}
                </Typography>
              </Box>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{
          width: { xs: 0, md: DRAWER_WIDTH },
          flexShrink: 0,
        }}
      >
        {isMobile ? (
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={() => setMobileOpen(false)}
            ModalProps={{ keepMounted: true }}
            sx={{
              "& .MuiDrawer-paper": {
                width: { xs: "min(290px, 88vw)", md: DRAWER_WIDTH },
                maxWidth: "100%",
                boxSizing: "border-box",
              },
            }}
          >
            {drawer}
          </Drawer>
        ) : (
          <Drawer
            variant="permanent"
            sx={{
              "& .MuiDrawer-paper": {
                width: DRAWER_WIDTH,
                boxSizing: "border-box",
                mt: "64px",
              },
            }}
            open
          >
            {drawer}
          </Drawer>
        )}
      </Box>

      <Box
        component="main"
        sx={{
          flex: 1,
          minWidth: 0,
          mt: "64px",
          bgcolor: "background.default",
          py: { xs: 2, sm: 3 },
          px: { xs: 1.5, sm: 2, md: 3 },
        }}
      >
        <Container
          maxWidth="lg"
          sx={{ mx: "auto", width: 1, maxWidth: "100%", textAlign: "left" }}
        >
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
};
