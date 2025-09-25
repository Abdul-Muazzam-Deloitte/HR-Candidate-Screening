import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import {
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  ChevronRight, 
  Briefcase, 
  User, 
  Calendar, 
  List, 
  BookOpen, 
  Building, 
  Zap,
  AlertTriangle, 
  UserCheck, 
  FileText, 
  Users, 
  ClipboardCheck, 
  Shield, 
  Mail, 
  Phone, 
  MapPin,
  Clipboard
} from "lucide-react";
import { ProcessStep, 
  ProcessNode, 
  ScreeningSession } from "../../types";

interface ProcessTrackerProps {
  session: ScreeningSession;
  nodes?: ProcessNode[];
}

export const ProcessTracker: React.FC<ProcessTrackerProps> = ({
  session,
  nodes = [],
}) => {

  const nodeRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [isExpanded, setIsExpanded] = useState(false);

const [selectedNodeId, setSelectedNodeId] = useState<string | null>("document_extraction")

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  // Scroll to bottom whenever nodes change
  // useLayoutEffect(() => {
  //   const lastNode = nodes[nodes.length - 1];
  //   if (lastNode && nodeRefs.current[lastNode.id]) {
  //     nodeRefs.current[lastNode.id]?.scrollIntoView({ behavior: "smooth" });
  //   }
  // }, [nodes]);

  const getNodeIcon = (status: ProcessNode["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "in_progress":
        return <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />;
      case "error":
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStepIcon = (status: ProcessStep["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "in_progress":
        return <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />;
      case "failed":
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getNodeColor = (status: ProcessNode["status"]) => {
    switch (status) {
      case "completed":
        return "border-green-200 bg-green-50";
      case "in_progress":
        return "border-blue-200 bg-blue-50 bg-wave";
      case "error":
        return "border-red-200 bg-red-50";
      default:
        return "border-gray-200 bg-gray-50";
    }
  };

  const getProcessIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'document_extraction':
        return <FileText className="w-4 h-4" />;
      case 'cv_scoring':
        return <CheckCircle className="w-4 h-4" />;
      case 'social_media_screening':
        return <Users className="w-4 h-4" />;
      case 'candidate_assessment':
        return <UserCheck className="w-4 h-4" />;
      case 'report_generation':
        return <FileText className="w-4 h-4" />;
      case 'question_generation':
        return <AlertTriangle className="w-4 h-4" />;
      case 'interview_in_progress':
        return <Clock className="w-4 h-4" />;
      case 'interview_completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'evaluated':
        return <CheckCircle className="w-4 h-4" />;
      case 'project_contribution':
        return <Briefcase className="w-4 h-4" />;
      case 'job_posting_determination':
        return <ClipboardCheck  className="w-4 h-4" />; 
      case 'world_check':
        return <Shield className="w-4 h-4" />; // 
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getSelectedNodeColor = (status: ProcessNode["status"]) => {
    switch (status) {
      case "completed":
        return "ring-2 ring-green-600"; // slightly darker green
      case "in_progress":
        return "ring-2 ring-blue-600"; // slightly darker blue
      case "error":
        return "ring-2 ring-red-600"; // slightly darker red
      default:
        return "ring-2 ring-gray-600";
    }
};

  return (
    <div className="flex flex-col bg-white rounded-lg shadow-sm border border-gray-200 h-full"> 
      {/* Card Header */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Agentic HR Matching Progress
        </h3>


    {/* Two-Pane Layout */}
    <div className="flex flex-1">
      {/* Left: Node List */}
      <div className="w-1/3 border-r border-gray-200 overflow-y-auto">
        <ul className="p-4 space-y-2">
          {nodes.map((node) => (
            <li
              key={node.id}
              onClick={() => setSelectedNodeId(node.id)}
              className={`flex items-center justify-between p-3 rounded-md cursor-pointer transition
                ${getNodeColor(node.status)}
                ${selectedNodeId === node.id ? getSelectedNodeColor(node.status) : ""}
              `}
            >
              <div className="flex items-center space-x-2">
                {getProcessIcon(node.id)}
                <span className="text-sm font-medium text-gray-800">{node.name}</span>
              </div>
              {getNodeIcon(node.status)}
            </li>
          ))}
        </ul>
      </div>

      {/* Right: Node Details */}
      <div className="w-2/3 overflow-y-auto p-4">
        {!selectedNode ? (
          <div className="text-center py-8">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Initializing LangGraph workflow...</p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col">
            {selectedNode.id === "document_extraction" && selectedNode.result ? (
              <DocumentExtractionResult result={selectedNode.result} />
            ) : selectedNode.result ? (
              <NodeResultCard result={selectedNode.result} title="Final Output" />
            ) : selectedNode.steps.length > 0 ? (
              <ExpandableSection title="Execution Steps" defaultOpen>
                {selectedNode.steps.map((step) => {
                  const displayedStatus =
                    selectedNode.status === "error" && step.status === "in_progress"
                      ? "failed"
                      : step.status;
                  return (
                    <div
                      key={step.id}
                      className="border rounded-md p-2 mb-2 bg-gray-50 flex items-center justify-between"
                    >
                      <div>
                        <span className="font-medium text-gray-800">{step.name}</span>
                        <p className="text-xs text-gray-600 mt-1">{step.message}</p>
                      </div>
                      {getStepIcon(displayedStatus)}
                    </div>
                  );
                })}
              </ExpandableSection>
            ) : (
              <p className="text-gray-500">No details available</p>
            )}
          </div>
        )}
      </div>
    </div>
  </div>
  </div>
  );
};

/* -------- Document Extraction -------- */
function DocumentExtractionResult({ result }: { result: any }) {
  return (
    <div className="space-y-6">
      {/* Candidate Info Card */}
      <div className="p-6 bg-white rounded-lg shadow border border-gray-200 max-w-4xl mx-auto">
        <h3 className="text-center text-xl font-semibold text-gray-900 mb-6 flex items-center justify-center gap-2">
          <UserCheck className="w-6 h-6 text-gray-500" />
          Candidate Information
        </h3>

        {/* Candidate Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-800 text-sm">
          <p className="flex items-center gap-2">
            <User className="w-4 h-4 text-gray-500" /> <strong>Name:</strong> {result.name || "—"}
          </p>
          <p className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-gray-500" /> <strong>Email:</strong> {result.email || "—"}
          </p>
          <p className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-gray-500" /> <strong>Phone:</strong> {result.phone || "—"}
          </p>
          <p className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gray-500" /> <strong>Address:</strong> {result.address || "—"}
          </p>
          <p className="col-span-2 flex items-center gap-2">
            <Clipboard className="w-4 h-4 text-gray-500" /> <strong>Summary:</strong> {result.summary || "—"}
          </p>
        </div>
      

      {/* Experience Section */}
      <div className="max-w-4xl mx-auto">
        <h4 className="text-lg font-semibold text-gray-900 mt-2 mb-2 flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-gray-500" /> Experience
        </h4>
        {result.experience?.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {result.experience.map((exp: any, idx: number) => (
              <div
                key={idx}
                className="border rounded-md p-4 bg-white shadow-sm flex flex-col h-full"
              >
                <div className="flex items-center gap-2 mb-1 text-sm font-medium text-gray-800">
                  <Briefcase className="w-4 h-4 text-gray-500" />
                  <span>{exp.company || "—"}</span>
                </div>
                <div className="flex items-center gap-2 mb-1 text-sm text-gray-700">
                  <User className="w-4 h-4 text-gray-500" />
                  <span>{exp.position || "—"}</span>
                </div>
                <div className="flex items-center gap-2 mb-1 text-xs text-gray-600">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span>{exp.duration || "—"}</span>
                </div>
                <div className="flex items-start gap-2 text-xs text-gray-600 mt-2 flex-1">
                  <List className="w-4 h-4 mt-1 text-gray-500" />
                  <ul className="list-disc list-inside">
                    {exp.responsibilities?.map((r: string, i: number) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No experience listed</p>
        )}
      </div>

      {/* Education Section */}
      <div className="max-w-4xl mx-auto">
        <h4 className="text-lg font-semibold text-gray-900 mt-2 mb-2 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-gray-500" /> Education
        </h4>
        {result.education?.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {result.education.map((edu: any, idx: number) => (
              <div
                key={idx}
                className="border rounded-md p-4 bg-white shadow-sm flex flex-col h-full"
              >
                <div className="flex items-center gap-2 mb-1 text-sm font-medium text-gray-800">
                  <BookOpen className="w-4 h-4 text-gray-500" />
                  <span>{edu.degree || "—"}</span>
                </div>
                <div className="flex items-center gap-2 mb-1 text-sm text-gray-700">
                  <Building className="w-4 h-4 text-gray-500" />
                  <span>{edu.institution || "—"}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600 mt-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span>{edu.year || "—"}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No education listed</p>
        )}
      </div>

      {/* Skills Section */}
      <div className="max-w-4xl mx-auto">
        <h4 className="text-lg font-semibold text-gray-900 mt-2 mb-2 flex items-center gap-2">
          <Zap className="w-5 h-5 text-gray-500" /> Skills
        </h4>
        {result.skills?.length ? (
          <div className="flex flex-wrap gap-2">
            {result.skills.map((s: string, idx: number) => (
              <span
                key={idx}
                className="flex items-center gap-1 bg-gray-100 text-gray-800 text-xs font-medium px-2 py-1 rounded-full"
              >
                {s}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 flex items-center gap-2">
            <Zap className="w-4 h-4 text-gray-500" /> —
          </p>
        )}
      </div>
      </div>
    </div>
  );
}


/* -------- Expandable Section -------- */
function ExpandableSection({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border rounded-md border-gray-200">
      <button
        className="w-full flex justify-between p-2 font-medium text-gray-700 hover:bg-gray-100 transition"
        onClick={() => setOpen(!open)}
      >
        {title}
        <ChevronRight
          className={`h-4 w-4 transition-transform ${open ? "rotate-90" : ""}`}
        />
      </button>
      {open && <div className="p-2 whitespace-pre-wrap">{children}</div>}
    </div>
  );
}

/* -------- Node Result Card -------- */
interface NodeResultCardProps {
  result: any;
  title?: string;
}

const formatKey = (key: string) =>
  key
    .split("_")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

export const NodeResultCard: React.FC<NodeResultCardProps> = ({ result, title = "Node Result" }) => {
  if (!result) return null;

  const renderObjectCard = (obj: any, keyPrefix: string) => {
    return Object.entries(obj).map(([key, value], idx) => {
      const displayKey = formatKey(key);

      if (Array.isArray(value)) {
        return (
          <ExpandableSection key={`${keyPrefix}-${idx}`} title={displayKey} defaultOpen={false}>
            <div className="space-y-2">
              {value.length
                ? value.map((item: any, i: number) =>
                    typeof item === "object" ? (
                      <div key={i} className="border rounded-md p-2 mb-2 bg-gray-50">
                        {renderObjectCard(item, `${keyPrefix}-${key}-${i}`)}
                      </div>
                    ) : (
                      <p key={i} className="text-sm text-gray-900">{item}</p>
                    )
                  )
                : <p className="text-sm text-gray-500">No {displayKey} listed</p>}
            </div>
          </ExpandableSection>
        );
      } else if (typeof value === "object" && value !== null) {
        return (
          <ExpandableSection key={`${keyPrefix}-${idx}`} title={displayKey} defaultOpen={false}>
            <div className="border rounded-md p-2 mb-2 bg-gray-50">
              {renderObjectCard(value, `${keyPrefix}-${key}`)}
            </div>
          </ExpandableSection>
        );
      } else {
        return (
          <div key={`${keyPrefix}-${idx}`} className="p-2 flex justify-between items-start border-b border-gray-100 text-sm text-gray-900 font-sans">
            <span className="font-semibold">{displayKey}:</span>
            <span className="ml-2 break-words whitespace-pre-wrap">{value !== null && value !== undefined ? String(value) : "—"}</span>
          </div>
        );
      }
    });
  };

  return (
    <div className="flex-1 p-4 bg-white border border-gray-200 rounded-lg shadow-sm space-y-2 font-sans text-gray-900">
      {title && <h5 className="font-semibold text-gray-900 mb-2">{title}</h5>}
      <div className="space-y-2">{renderObjectCard(result, "root")}</div>
    </div>
  );
};
