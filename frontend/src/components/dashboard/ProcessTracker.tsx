import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import {
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  ChevronRight,
} from "lucide-react";
import { NodeStep, ProcessNode, ScreeningSession } from "../../types";
import { useScreening } from "../../contexts/ScreeningContext";

interface ProcessTrackerProps {
  session: ScreeningSession;
  nodes?: ProcessNode[];
}

export const ProcessTracker: React.FC<ProcessTrackerProps> = ({
  session,
  nodes = [],
}) => {

  const nodeRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Scroll to bottom whenever nodes change
  useLayoutEffect(() => {
    const lastNode = nodes[nodes.length - 1];
    if (lastNode && nodeRefs.current[lastNode.id]) {
      nodeRefs.current[lastNode.id]?.scrollIntoView({ behavior: "smooth" });
    }
  }, [nodes]);

  const { currentSession } = useScreening();

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

  const getStepIcon = (status: NodeStep["status"]) => {
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
        return "border-blue-200 bg-blue-50";
      case "error":
        return "border-red-200 bg-red-50";
      default:
        return "border-gray-200 bg-gray-50";
    }
  };

  const formatTimestamp = (timestamp: Date) =>
    new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).format(new Date(timestamp));

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        LangGraph Workflow Progress
      </h3>

      <div className="mb-4 flex justify-between text-sm text-gray-600">
        <span>Candidate: {session.candidate.name}</span>
        <span>{new Date(session.createdAt).toLocaleDateString()}</span>
      </div>

      <div className="space-y-4">
        {nodes.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Initializing LangGraph workflow...</p>
          </div>
        ) : (
          nodes.map((node) => (
            <div
              key={node.id}
              ref={(el) => (nodeRefs.current[node.id] = el)}
              className={`border rounded-lg transition-all duration-200 ${getNodeColor(
                node.status
              )}`}
            >
              <div className="flex items-center justify-between p-4 cursor-pointer">
                <div className="flex items-center space-x-3">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">
                      {node.name}
                    </h4>
                    <p className="text-xs text-gray-500">
                      {formatTimestamp(node.timestamp)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {node.status === "error" && node.error && (
                    <p className="text-sm text-red-700">{node.error}</p>
                  )}
                  {getNodeIcon(node.status)}
                </div>
              </div>

              <div className="p-4 border-t border-gray-200 bg-white space-y-4">
                {/* Document Extraction Result */}
                {node.id === "document_extraction" && node.result && (
                  <DocumentExtractionResult result={node.result} />
                )}

                {/* Steps (always visible) */}
                {!node.result && node.steps.length > 0 && (
                  <ExpandableSection title="Execution Steps" defaultOpen>
                       {node.steps.map((step) => {
                        // Determine displayed status: if node errored, mark running step as 'failed'
                        const displayedStatus =
                          node.status === "error" && step.status === "in_progress"
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
                )}

                {/* Streaming tokens */}
                {node.streamingTokens && !node.result && (
                  <StreamingOutput content={node.streamingTokens} title="Streaming..."/>
                )}

                {/* Other nodes - generic result display */}
                {node.result && node.id !== "document_extraction" && (
                  <NodeResultCard result={node.result} title={"Final Output"} />
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

/* -------- Document Extraction -------- */
function DocumentExtractionResult({ result }: { result: any }) {
  return (
    <div className="space-y-4">
      <div className="border rounded-md p-3 bg-white border-gray-200">
        <h5 className="font-semibold text-gray-900 mb-2">Candidate Information</h5>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-800">
          <p><strong>Name:</strong> {result.name || "—"}</p>
          <p><strong>Email:</strong> {result.email || "—"}</p>
          <p><strong>Phone:</strong> {result.phone || "—"}</p>
          <p><strong>Address:</strong> {result.address || "—"}</p>
          <p className="col-span-2"><strong>Summary:</strong> {result.summary || "—"}</p>
          <p className="col-span-2"><strong>LinkedIn:</strong> {result.linkedin_url || "—"}</p>
        </div>
      </div>

      <ExpandableSection title="Experience" defaultOpen>
        {result.experience?.length ? (
          result.experience.map((exp: any, idx: number) => (
            <div key={idx} className="border rounded-md p-2 mb-2 bg-gray-50">
              <h6 className="font-medium">{exp.role || "—"} @ {exp.company || "—"}</h6>
              <p><strong>Duration:</strong> {exp.duration || "—"}</p>
              <ul className="list-disc list-inside text-xs text-gray-700 mt-1">
                {exp.responsibilities?.map((r: string, i: number) => <li key={i}>{r}</li>)}
              </ul>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500">No experience listed</p>
        )}
      </ExpandableSection>

      <ExpandableSection title="Education" defaultOpen>
        {result.education?.length ? (
          result.education.map((edu: any, idx: number) => (
            <div key={idx} className="border rounded-md p-2 mb-2 bg-gray-50">
              <h6 className="font-medium">{edu.degree || "—"}</h6>
              <p><strong>Institution:</strong> {edu.institution || "—"}</p>
              <p><strong>Year:</strong> {edu.year || "—"}</p>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500">No education listed</p>
        )}
      </ExpandableSection>

      <ExpandableSection title="Skills" defaultOpen>
        <ul className="list-disc list-inside text-sm text-gray-700">
          {result.skills?.length ? result.skills.map((s: string, idx: number) => <li key={idx}>{s}</li>) : <li>—</li>}
        </ul>
      </ExpandableSection>
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
    <div className="border rounded-md">
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

/* -------- Streaming Output styled like NodeResultCard -------- */
// interface StreamingOutputProps {
//   content: string;
//   title?: string;
// }

// export const StreamingOutput: React.FC<StreamingOutputProps> = ({ content, title = "Streaming Output" }) => {
//   const containerRef = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     if (containerRef.current) {
//       containerRef.current.scrollTop = containerRef.current.scrollHeight;
//     }
//   }, [content]);

//   return (
//     <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm space-y-2 font-sans text-gray-900">
//       {title && <h5 className="font-semibold text-gray-900 mb-2">{title}</h5>}
//       <div
//         ref={containerRef}
//         className="p-2 bg-white text-sm whitespace-pre-wrap max-h-60 overflow-y-auto font-sans text-gray-900"
//       >
//         {content}
//       </div>
//     </div>
//   );
// };

interface StreamingOutputProps {
  content: string;
  title?: string;
}

export const StreamingOutput: React.FC<StreamingOutputProps> = ({ content, title = "Streaming Output" }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [content]);

  return (
    <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm space-y-2 font-sans text-gray-900">
      {title && <h5 className="font-semibold text-gray-900 mb-2">{title}</h5>}
      <div
        ref={containerRef}
        className="p-2 bg-white text-sm whitespace-pre-wrap max-h-60 overflow-y-auto font-sans text-gray-900"
      >
        {content}
      </div>
    </div>
  );
};


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
    <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm space-y-2 font-sans text-gray-900">
      {title && <h5 className="font-semibold text-gray-900 mb-2">{title}</h5>}
      <div className="space-y-2">{renderObjectCard(result, "root")}</div>
    </div>
  );
};
