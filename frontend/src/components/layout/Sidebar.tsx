import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Upload, FileText, BarChart3, Users, ChevronLeft, ChevronRight, MessageSquare } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useScreening } from '../../contexts/ScreeningContext';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { sessions } = useScreening();

  // Check if candidate has any sessions with questions ready
  const hasInterviewQuestions = user?.role === 'candidate' && 
    sessions.some(session => session.status === 'question_generation');
  const navigationItems = [
    {
      name: 'Dashboard',
      icon: BarChart3,
      path: '/dashboard',
      roles: ['hr', 'candidate']
    },
    {
      name: 'New Process',
      icon: Upload,
      path: '/new-screening',
      roles: ['hr']
    },
    {
      name: 'Job Postings',
      icon: FileText,
      path: '/job-descriptions',
      roles: ['hr']
    },
    {
      name: 'Interview',
      icon: MessageSquare,
      path: '/interview',
      roles: ['candidate'],
      showCondition: hasInterviewQuestions
    }
  ];

  const filteredItems = navigationItems.filter(item => 
    item.roles.includes(user?.role || '') && 
    (item.showCondition === undefined || item.showCondition)
  );

  const handleInterviewClick = () => {
    // Find the first session with questions ready
    const sessionWithQuestions = sessions.find(session => 
      session.status === 'question_generation'
    );
    
    if (sessionWithQuestions) {
      navigate(`/interview/${sessionWithQuestions.id}`);
    }
  };
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className={`${isCollapsed ? 'w-16' : 'w-64'} bg-white shadow-sm border-r border-gray-200 h-full transition-all duration-300 flex flex-col`}>
      <div className="p-6 flex-1">

        <nav className="space-y-2">
          {filteredItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.name}
                onClick={() => {
                  if (item.name === 'Interview') {
                    handleInterviewClick();
                  } else {
                    navigate(item.path);
                  }
                }}
                className={`w-full flex items-center ${isCollapsed ? 'justify-center px-1' : 'px-3 space-x-3'} py-2 rounded-lg text-left transition-colors ${
                  (item.name === 'Interview' ? location.pathname.includes('/interview') : isActive(item.path))
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
                title={isCollapsed ? item.name : undefined}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${
                  (item.name === 'Interview' ? location.pathname.includes('/interview') : isActive(item.path)) 
                    ? 'text-blue-600' : 'text-gray-400'
                }`} />
                {!isCollapsed && <span className="font-medium">{item.name}</span>}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Toggle Button - Chevron Only at Bottom Right */}
      <div className="relative">
        <button
          onClick={onToggle}
          className="absolute bottom-4 right-4 w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors shadow-sm border border-gray-200 bg-white"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </button>
      </div>
    </div>
  );
};