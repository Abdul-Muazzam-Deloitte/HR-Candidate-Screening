import React, { useState } from "react";
import {
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  ChevronRight,
} from "lucide-react";
import { ProcessNode, ScreeningSession } from "../../types";
import { useScreening } from "../../contexts/ScreeningContext";

interface ProcessTrackerProps {
  session: ScreeningSession;
  nodes?: ProcessNode[];
}

export const ProcessTracker: React.FC<ProcessTrackerProps> = ({
  session,
  nodes = [],
}) => {
  const { toggleNodeExpansion } = useScreening();

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
              className={`border rounded-lg transition-all duration-200 ${getNodeColor(
                node.status
              )}`}
            >
              <div className="flex items-center justify-between p-4 cursor-pointer">
                <div className="flex items-center space-x-3">
                  {getNodeIcon(node.status)}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">
                      {node.name}
                    </h4>
                    <p className="text-xs text-gray-500">
                      {formatTimestamp(node.timestamp)}
                    </p>
                  </div>
                </div>
                {node.status === "error" && node.error && (
                  <p className="text-sm text-red-700">{node.error}</p>
                )}
              </div>

              <div className="p-4 border-t border-gray-200 bg-white bg-opacity-50 space-y-4">
                {node.id === "document_extraction" && node.result && (
                  <DocumentExtractionResult result={node.result} />
                )}

                {!node.result && node.steps.length > 0 && (
                  <ExpandableSection title="Execution Steps" defaultOpen>
                    {node.steps.map((step) => (
                      <div
                        key={step.id}
                        className="border rounded-md p-2 mb-2 bg-gray-50 flex items-center justify-between"
                      >
                        <div>
                          <span className="font-medium text-gray-800">
                            {step.name}
                          </span>
                          <p className="text-xs text-gray-600 mt-1">
                            {step.message}
                          </p>
                        </div>
                        {step.status === "in_progress" && (
                          <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                        )}
                      </div>
                    ))}
                  </ExpandableSection>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

/* -------- Document Extraction Subcomponent -------- */
function DocumentExtractionResult({ result }: { result: any }) {
  return (
    <div className="space-y-4">
      {/* Candidate Info */}
      <div className="border rounded-md p-3 bg-green-50">
        <h5 className="font-semibold text-green-700 mb-2">
          Candidate Information
        </h5>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
          <p>
            <strong>Name:</strong> {result.name || "—"}
          </p>
          <p>
            <strong>Email:</strong> {result.email || "—"}
          </p>
          <p>
            <strong>Phone:</strong> {result.phone || "—"}
          </p>
          <p>
            <strong>Address:</strong> {result.address || "—"}
          </p>
          <p className="col-span-2">
            <strong>Summary:</strong> {result.summary || "—"}
          </p>
          <p className="col-span-2">
            <strong>LinkedIn:</strong> {result.linkedin_url || "—"}
          </p>
        </div>
      </div>

      <ExpandableSection title="Skills" defaultOpen>
        <ul className="list-disc list-inside text-sm text-gray-700">
          {result.skills?.length
            ? result.skills.map((s: string, idx: number) => <li key={idx}>{s}</li>)
            : <li>—</li>}
        </ul>
      </ExpandableSection>

      <ExpandableSection title="Experience" defaultOpen>
        {result.experience?.length ? (
          result.experience.map((exp: any, idx: number) => (
            <div key={idx} className="border rounded-md p-2 mb-2 bg-gray-50">
              <h6 className="font-medium">
                {exp.role || "—"} @ {exp.company || "—"}
              </h6>
              <p>
                <strong>Duration:</strong> {exp.duration || "—"}
              </p>
              <ul className="list-disc list-inside text-xs text-gray-700 mt-1">
                {exp.responsibilities?.map((r: string, i: number) => (
                  <li key={i}>{r}</li>
                ))}
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
              <p>
                <strong>Institution:</strong> {edu.institution || "—"}
              </p>
              <p>
                <strong>Year:</strong> {edu.year || "—"}
              </p>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500">No education listed</p>
        )}
      </ExpandableSection>
    </div>
  );
}

/* -------- Small reusable Expandable Section -------- */
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
      {open && <div className="p-2">{children}</div>}
    </div>
  );
}
