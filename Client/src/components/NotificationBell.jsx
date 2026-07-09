import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { getNotifications, getUnreadCount, markAsRead, markAllAsRead } from "../services/notificationService";
import { Bell, X, CheckCheck, ExternalLink } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

const NotificationBell = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const fetchNotifications = useCallback(async () => {
    try {
      const [notifData, countData] = await Promise.all([
        getNotifications(),
        getUnreadCount()
      ]);
      setNotifications(notifData || []);
      setUnreadCount(countData?.count || 0);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  }, []);

  useEffect(() => {
    if (user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchNotifications();

      const genericHandler = (e) => {
        const notif = e.detail;
        toast(notif?.message || 'New notification', {
          duration: 5000,
          position: 'top-right',
          style: { background: '#7c3aed', color: 'white' },
        });
        fetchNotifications();
      };

      const assignedHandler = (e) => {
        const payload = e.detail;
        const title = payload?.title || payload?.task?.title || 'a task';
        toast(`📋 New task assigned: ${title}`, {
          duration: 5000,
          position: 'top-right',
          style: { background: '#2563eb', color: 'white' },
        });
        fetchNotifications();
      };

      const completedHandler = (e) => {
        const payload = e.detail;
        const member = payload?.task?.assignedTo?.name || 'A member';
        const title = payload?.task?.title || payload?.title || 'a task';
        toast(`✅ ${member} completed ${title}`, {
          duration: 5000,
          position: 'top-right',
          style: { background: '#16a34a', color: 'white' },
        });
        fetchNotifications();
      };

      const delayedHandler = (e) => {
        const payload = e.detail;
        const title = payload?.title || payload?.task?.title || 'a task';
        toast(`⚠️ Task overdue: ${title}`, {
          duration: 5000,
          position: 'top-right',
          style: { background: '#dc2626', color: 'white' },
        });
        fetchNotifications();
      };

      window.addEventListener('mm:notification-new', genericHandler);
      window.addEventListener('mm:task-assigned', assignedHandler);
      window.addEventListener('mm:task-completed', completedHandler);
      window.addEventListener('mm:task-delayed', delayedHandler);

      return () => {
        window.removeEventListener('mm:notification-new', genericHandler);
        window.removeEventListener('mm:task-assigned', assignedHandler);
        window.removeEventListener('mm:task-completed', completedHandler);
        window.removeEventListener('mm:task-delayed', delayedHandler);
      };
    }
  }, [user, fetchNotifications]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await markAsRead(id);
      setNotifications((prev) => prev.map((n) => n._id === id ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (err) {
      console.error(err);
    }
  };

  const getNotificationIcon = (type) => {
    const icons = {
      project_created: { icon: '📁', className: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
      task_started: { icon: '▶️', className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
      task_completed: { icon: '✅', className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
      task_assigned: { icon: '🎯', className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
      member_report: { icon: '📝', className: 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400' },
      team_report: { icon: '📊', className: 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400' },
      delay: { icon: '⚠️', className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
      completion: { icon: '🎉', className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
    };
    return icons[type] || { icon: '🔔', className: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' };
  };

  const getTimeAgo = (date) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch {
      return 'just now';
    }
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.read) {
      await handleMarkAsRead(notif._id);
    }

    if (notif.relatedProject) {
      navigate(`/projects/${notif.relatedProject?._id || notif.relatedProject}`);
    } else if (notif.relatedTask) {
      navigate('/tasks');
    }

    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white shadow-lg">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 z-50 max-h-[420px] flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">Notifications</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-xs text-purple-600 dark:text-purple-400 hover:text-purple-700 font-medium flex items-center gap-1"
                >
                  <CheckCheck size={14} />
                  Mark all read
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell size={32} className="text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-400">No notifications yet</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif._id}
                  className={`flex items-start gap-3 border-b border-gray-50 p-4 transition-colors last:border-b-0 hover:bg-gray-50 dark:border-gray-700/50 dark:hover:bg-gray-700/30 ${
                    !notif.read ? 'border-l-4 border-l-purple-500 bg-purple-50/70 dark:bg-purple-900/10' : ''
                  }`}
                  onClick={() => handleNotificationClick(notif)}
                >
                  <span className={`mt-0.5 flex h-9 w-9 items-center justify-center rounded-full text-lg ${getNotificationIcon(notif.type).className}`}>
                    {getNotificationIcon(notif.type).icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${!notif.read ? 'font-semibold text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300'}`}>
                      {notif.message}
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-xs text-gray-400">{getTimeAgo(notif.createdAt)}</span>
                      {notif.fromUser && (
                        <span className="text-xs text-gray-400">by {notif.fromUser.name}</span>
                      )}
                    </div>
                    {(notif.relatedProject || notif.relatedTask) && (
                      <div className="mt-2 flex items-center gap-1 text-xs font-medium text-purple-600 dark:text-purple-400">
                        <ExternalLink size={10} />
                        Open related item
                      </div>
                    )}
                  </div>
                  {!notif.read && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkAsRead(notif._id);
                      }}
                      className="flex-shrink-0 rounded-lg p-1 text-gray-400 hover:bg-purple-50 hover:text-purple-600 dark:hover:bg-purple-900/20"
                    >
                      <CheckCheck size={14} />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>

          <div className="border-t border-gray-100 p-3 dark:border-gray-700">
            <Link to="/" onClick={() => setIsOpen(false)} className="flex items-center justify-center text-sm font-medium text-purple-600 hover:text-purple-700 dark:text-purple-400">
              View all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;