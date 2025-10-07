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
  ChevronLeft,
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
  Clipboard,
  BarChart3,
  ClipboardList,
  Github,
  Linkedin,
  ShieldCheck,
  CreditCard,
  Globe,
  Plus,
  StickyNote,
  X
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

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>("document_extraction")
  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  const updateNodeStatus = (nodeId: string, status: ProcessNode["status"]) => {
  const nodeIndex = nodes.findIndex((n) => n.id === nodeId);
    if (nodeIndex !== -1) {
      nodes[nodeIndex] = { ...nodes[nodeIndex], status };
      // force re-render
      setSelectedNodeId((prev) => (prev === nodeId ? nodeId : prev));
    }
  };


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
      case "verify": // new color
        return "border-yellow-300 bg-yellow-50";
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
      case "verify": // new color
        return "ring-2 ring-yellow-500";
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
        <h2 className="text-lg font-bold text-blue-900">
          Agentic Candidate Matching Progress
        </h2>
      </div>

      {!selectedNode ? (
          <div className="text-center py-8">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Initializing Matching workflow...</p>
          </div>
        ) : (
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
              {selectedNode && ( 
                <div className="flex-1 flex flex-col">
                  {selectedNode.id === "document_extraction" && selectedNode.result ? (
                    <DocumentExtractionResult onNoteAdded={(newStatus) => updateNodeStatus(selectedNode.id, newStatus)} result={selectedNode.result} />
                  ) : selectedNode.id === "job_posting_determination" && selectedNode.result ? (
                      <JobPostingCarousel postings={selectedNode.result} />
                  ) : selectedNode.id === "project_contribution" && selectedNode.result ? (
                      <ProjectInfoCard project={selectedNode.result} />
                  ) : selectedNode.id === "social_media_screening" && selectedNode.result ? (
                      <SocialMediaCarousel data={selectedNode.result} />
                  ) : selectedNode.id === "world_check" && selectedNode.result ? (
                      <WorldCheckCard data={selectedNode.result} />
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
        )
      }
    </div>
  );
};

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


interface JobScoreDetail {
  score: number;
  notes: string;
}

interface JobPostingScore {
  technical_skills: JobScoreDetail;
  experience_relevance: JobScoreDetail;
  years_experience: JobScoreDetail;
  project_fit: JobScoreDetail;
  soft_skills: JobScoreDetail;
  education_certifications: JobScoreDetail;
  communication: JobScoreDetail;
  overall_recommendation: "Strong Fit" | "Good Fit" | "Moderate Fit" | "Poor Fit";
}

interface JobDescription {
  id: string;
  title: string;
  department: string;
  description: string;
  experience: string;
  skills: string[];
  requirements: string[];
  createdAt: string;
  updatedAt?: string;
  job_postings_vector: string;
}

interface JobPosting {
  job_posting: JobDescription;
  job_posting_score: JobPostingScore;
}

interface JobPostingCarouselProps {
  postings: JobPosting[];
}

const JobPostingCarousel: React.FC<JobPostingCarouselProps> = ({ postings }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!postings?.length) {
    return <p className="text-sm text-gray-500">No job postings available</p>;
  }

  const { job_posting: job, job_posting_score: score } = postings[currentIndex];

  return (
    <div className="space-y-3 w-full">

      {/* Job Posting Details Card */}
      <div className="p-6 bg-white rounded-lg shadow border border-gray-200">
        <h3 className="text-center text-xl font-semibold text-blue-900 mb-6 flex items-center justify-center gap-2">
          <Briefcase className="w-6 h-6 text-gray-500" /> {job.title}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <p className="flex items-center gap-2">
            <Building className="w-4 h-4 text-gray-500" /> 
            <strong>Department:</strong> {job.department}
          </p>
          <p className="flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-gray-500" /> 
            <strong>Experience:</strong> {job.experience}
          </p>
          <p className="col-span-2 flex items-center gap-2">
            <Clipboard className="w-4 h-4 text-gray-500" /> 
            <strong>Description:</strong> {job.description}
          </p>
        </div>


       {/* Skills */}
        <div className="mt-4">
          <h4 className="text-lg font-semibold text-blue-900 mb-2 flex items-center gap-2">
            <Zap className="w-5 h-5 text-gray-500" /> Skills
          </h4>
          <div className="flex flex-wrap gap-2">
            {job.skills.map((s, idx) => (
              <span
                key={idx}
                className="flex items-center gap-1 bg-blue-100 text-gray-800 text-xs font-medium px-2 py-1 rounded-full
                          transition-all duration-200 transform hover:bg-blue-200 hover:scale-105 cursor-pointer"
              >
                <Zap className="w-3 h-3 text-gray-500" />
                {s}
              </span>
            ))}
          </div>
        </div>

        {/* Requirements */}
        <div className="mt-4">
          <h4 className="text-lg font-semibold text-blue-900 mb-2 flex items-center gap-2">
            <Zap className="w-5 h-5 text-gray-500" /> Requirements
          </h4>
          <div className="flex flex-wrap gap-2">
            {job.requirements.map((r, idx) => (
              <span
                key={idx}
                className="flex items-center gap-1 bg-blue-100 text-gray-800 text-xs font-medium px-2 py-1 rounded-full
                          transition-all duration-200 transform hover:bg-blue-200 hover:scale-105 cursor-pointer"
              >
                <Zap className="w-3 h-3 text-gray-500" />
                {r}
              </span>
            ))}
          </div>
        </div>


        {/* Job Score */}
        <div className="mt-4 ">
          <div className="flex items-center gap-2 mb-4">
            <h5 className="text-lg font-semibold text-blue-900 mb-2 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-gray-500" /> Scoring Overview
            </h5>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            {[
              { label: "Technical Skills", data: score.technical_skills },
              { label: "Experience Relevance", data: score.experience_relevance },
              { label: "Years Experience", data: score.years_experience },
              { label: "Project Fit", data: score.project_fit },
              { label: "Soft Skills", data: score.soft_skills },
              { label: "Education", data: score.education_certifications },
              { label: "Communication", data: score.communication },
            ].map((item, idx) => {
             
              // Determine color based on numericScore
              const colorClass =
                item.data.score <= 2
                  ? "bg-red-500"
                  : item.data.score === 3
                  ? "bg-yellow-400"
                  : item.data.score === 4
                  ? "bg-blue-400"
                  : "bg-green-500";

              return (
                <div key={idx} className="flex items-center gap-2">
                  <span className="font-medium text-gray-800 w-40">{item.label}:</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <span
                        key={i}
                        className={`w-4 h-4 rounded-full ${i <= item.data.score ? colorClass : "bg-gray-300"}`}
                        title={item.data.notes}
                      />
                    ))}
                    <span className="ml-2 text-gray-700">{item.data.score}/5</span>
                  </div>
                </div>
              );
            })}
          </div>



          {/* Overall Recommendation */}
          <div className="mt-6 p-4 border-t border-gray-200 flex items-center justify-between bg-gray-50 rounded-md">
            <span className="font-semibold text-gray-900 text-lg">Overall Recommendation:</span>
            <span
              className={`px-3 py-1 rounded-full font-semibold text-white ${
                score.overall_recommendation === "Strong Fit"
                  ? "bg-green-600"
                  : score.overall_recommendation === "Good Fit"
                  ? "bg-blue-600"
                  : score.overall_recommendation === "Moderate Fit"
                  ? "bg-yellow-500"
                  : "bg-red-600"
              }`}
            >
              {score.overall_recommendation}
            </span>
          </div>
        </div>
      </div>

      {/* Carousel Navigation Card */}
      <div className="p-4 bg-white rounded-lg shadow border border-gray-200 flex items-center justify-between">
        <button
          onClick={() => setCurrentIndex(currentIndex === 0 ? postings.length - 1 : currentIndex - 1)}
          className="p-2 rounded-full bg-gray-100 hover:bg-gray-200"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="text-sm text-gray-500">
          {currentIndex + 1} / {postings.length}
        </span>
        <button
          onClick={() => setCurrentIndex(currentIndex === postings.length - 1 ? 0 : currentIndex + 1)}
          className="p-2 rounded-full bg-gray-100 hover:bg-gray-200"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

interface RepositoryInfo {
  name: string;
  url: string;
  description: string;
  fork: boolean;
}

interface ProjectInfo {
  platform: string;
  repositories: RepositoryInfo[];
}

interface ProjectInfoCardProps {
  project: ProjectInfo;
}

const ProjectInfoCard: React.FC<ProjectInfoCardProps> = ({ project }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const postings = project.repositories;
  const visibleCount = 4; // 2 per row * 2 rows

  if (!postings || postings.length === 0) {
    return (
      <div className="p-6 bg-white rounded-lg shadow border border-gray-200 max-w-4xl mx-auto text-center text-gray-500">
        <Github className="w-6 h-6 mx-auto mb-2 text-gray-400" />
        <p>No projects available for {project.platform}</p>
      </div>
    );
  }

  const displayedPostings = postings.slice(
    currentIndex,
    currentIndex + visibleCount
  );

  const handlePrev = () => {
    setCurrentIndex((prev) =>
      prev - visibleCount < 0 ? Math.max(postings.length - visibleCount, 0) : prev - visibleCount
    );
  };

  const handleNext = () => {
    setCurrentIndex((prev) =>
      prev + visibleCount >= postings.length ? 0 : prev + visibleCount
    );
  };

  return (
    <div className="space-y-3 w-full">
      {/* Header */}
      <div className="p-6 bg-white rounded-lg shadow border border-gray-200 flex items-center justify-center gap-2">
        <Github className="w-6 h-6 text-gray-500" />
        <h3 className="text-xl font-semibold text-blue-900">{project.platform} Projects</h3>
      </div>

      {/* Repository Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {displayedPostings.map((repo, idx) => (
          <div
            key={idx}
            className="border border-blue-200 rounded-md p-4 bg-white shadow-sm flex flex-col h-full"
          >
            <a
              href={repo.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm font-medium text-blue-700 hover:underline mb-1"
            >
              <Github className="w-4 h-4 text-gray-500" />
              {repo.name}
            </a>
            <p className="text-xs text-gray-700 mb-2 line-clamp-3" title={repo.description}>
              {repo.description || "—"}
            </p>
            <p className="text-xs text-gray-500 mt-auto">
              {repo.fork ? "Forked repository" : "Original repository"}
            </p>
          </div>
        ))}
      </div>

      {/* Carousel Navigation */}
      {postings.length > visibleCount && (
        <div className="mt-4 p-4 bg-white rounded-lg shadow border border-gray-200 flex items-center justify-between">
          <button onClick={handlePrev} className="p-2 rounded-full bg-gray-100 hover:bg-gray-200">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm text-gray-500">
            {currentIndex + 1} – {Math.min(currentIndex + visibleCount, postings.length)} / {postings.length}
          </span>
          <button onClick={handleNext} className="p-2 rounded-full bg-gray-100 hover:bg-gray-200">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};

interface ScoreDetail {
  score: number;
  explanation?: string;
  notes?: string;
}

interface SocialMediaScore {
  social_media_platform: string;
  professional_presence: ScoreDetail;
  content_quality: ScoreDetail;
  communication_style: ScoreDetail;
  industry_engagement: ScoreDetail;
  red_flags: ScoreDetail;
  overall_social_score: number;
  screening_recommendation: string;
  notes?: string;
  error: boolean;
}

interface SocialMediaCarouselProps {
  data: SocialMediaScore[];
}

const SocialMediaCarousel: React.FC<SocialMediaCarouselProps> = ({ data }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!data || data.length === 0) {
    return (
      <div className="p-6 bg-white rounded-lg shadow border border-gray-200 max-w-4xl mx-auto text-center text-gray-500">
        <Linkedin className="w-6 h-6 mx-auto mb-2 text-gray-400" />
        <p>No social media data available</p>
      </div>
    );
  }

  const currentItem = data[currentIndex];

  // Helper to get color based on score
  const getColorClass = (score: number) =>
    score <= 2
      ? "bg-red-500"
      : score === 3
      ? "bg-yellow-400"
      : score === 4
      ? "bg-blue-400"
      : "bg-green-500";

  return (
    <div className="space-y-3 w-full">
      {/* Card */}
      <div className="p-6 bg-white rounded-lg shadow border border-gray-200">
        <h3 className="text-center text-xl font-semibold text-blue-900 mb-6 flex items-center justify-center gap-2">
          <Linkedin className="w-6 h-6 text-gray-500" />
          {currentItem.social_media_platform}
        </h3>

        {/* Scores */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          {[
            { label: "Professional Presence", data: currentItem.professional_presence },
            { label: "Content Quality", data: currentItem.content_quality },
            { label: "Communication Style", data: currentItem.communication_style },
            { label: "Industry Engagement", data: currentItem.industry_engagement },
            { label: "Red Flags", data: currentItem.red_flags },
          ].map((item, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="font-medium text-gray-800 w-44">{item.label}:</span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <span
                    key={i}
                    className={`w-4 h-4 rounded-full ${
                      i <= item.data.score ? getColorClass(item.data.score) : "bg-gray-300"
                    }`}
                    title={item.data.explanation || item.data.notes || "No explanation"}
                  />
                ))}
                <span className="ml-2 text-gray-700">{item.data.score}/5</span>
              </div>
            </div>
          ))}
        </div>

        {/* Overall Score */}
        <div className="mt-6 p-4 border-t border-gray-200 flex items-center justify-between bg-gray-50 rounded-md">
          <span className="font-semibold text-gray-900 text-lg">Overall Score:</span>
          <span
            className={`px-3 py-1 rounded-full font-semibold text-white ${
              currentItem.overall_social_score <= 2
                ? "bg-red-600"
                : currentItem.overall_social_score === 3
                ? "bg-yellow-500"
                : currentItem.overall_social_score === 4
                ? "bg-blue-600"
                : "bg-green-600"
            }`}
          >
            {currentItem.overall_social_score}/5
          </span>
        </div>

        {/* Recommendation */}
        <div className="mt-4 p-3 bg-gray-50 rounded-md text-gray-700 text-sm">
          Recommendation: {currentItem.screening_recommendation}
        </div>

        {/* Notes */}
        {currentItem.notes && (
          <div className="mt-2 p-3 bg-gray-50 rounded-md text-gray-500 text-sm line-clamp-3" title={currentItem.notes}>
            Notes: {currentItem.notes}
          </div>
        )}
      </div>

      {/* Carousel Navigation */}
      {data.length > 1 && (
        <div className="p-4 bg-white rounded-lg shadow border border-gray-200 flex items-center justify-between">
          <button
            onClick={() => setCurrentIndex(currentIndex === 0 ? data.length - 1 : currentIndex - 1)}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm text-gray-500">
            {currentIndex + 1} / {data.length}
          </span>
          <button
            onClick={() => setCurrentIndex(currentIndex === data.length - 1 ? 0 : currentIndex + 1)}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};


interface WorldCheckProps {
  data: {
    nationality_id: string;
    passport_id?: string;
    first_name: string;
    last_name: string;
    address: string;
    email?: string;
    phone_number?: string;
    nationality: string;
    morality: string;
  };
}

const WorldCheckCard: React.FC<WorldCheckProps> = ({ data }) => {
  return (
    <div className="p-6 bg-white rounded-lg shadow border border-gray-200 w-full max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <h3 className="text-center text-xl font-semibold text-blue-900 mb-6 flex items-center justify-center gap-2">
        <ShieldCheck className="w-6 h-6 text-gray-500" />
        World Check Information
      </h3>

      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-800">
        <p className="flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-gray-500" /> 
          <strong>National ID:</strong> {data.nationality_id}
        </p>
        <p className="flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-gray-500" /> 
          <strong>Passport ID:</strong> {data.passport_id || "—"}
        </p>
        <p className="flex items-center gap-2">
          <User className="w-4 h-4 text-gray-500" /> 
          <strong>First Name:</strong> {data.first_name}
        </p>
        <p className="flex items-center gap-2">
          <User className="w-4 h-4 text-gray-500" /> 
          <strong>Last Name:</strong> {data.last_name}
        </p>
        <p className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-gray-500" /> 
          <strong>Address:</strong> {data.address}
        </p>
        <p className="flex items-center gap-2">
          <Mail className="w-4 h-4 text-gray-500" /> 
          <strong>Email:</strong> {data.email || "—"}
        </p>
        <p className="flex items-center gap-2">
          <Phone className="w-4 h-4 text-gray-500" /> 
          <strong>Phone:</strong> {data.phone_number || "—"}
        </p>
        <p className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-gray-500" /> 
          <strong>Nationality:</strong> {data.nationality}
        </p>
      </div>

      {/* Morality Certificate */}
      <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-md text-gray-700 text-sm flex items-start gap-2">
        <ShieldCheck className="w-5 h-5 text-gray-500 mt-1" />
        <span>
          <strong>Morality Certificate:</strong> {data.morality}
        </span>
      </div>
    </div>
  );
};

interface DocumentExtractionResultProps {
  onNoteAdded: (newStatus: ProcessNode["status"]) => void;
  result: any;
}

interface Note {
  section: string;
  text: string;
}

const DocumentExtractionResult: React.FC<DocumentExtractionResultProps> = ({ onNoteAdded, result }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [tempNote, setTempNote] = useState<string>("");
  const [sidebarVisible, setSidebarVisible] = useState<boolean>(false);
  

  const handleSaveNote = () => {
    if (activeSection && tempNote.trim()) {
      setNotes((prev) => [...prev, { section: activeSection, text: tempNote }]);
      setSidebarVisible(true);
      // onNoteAdded("verify");
    }
    setActiveSection(null);
    setTempNote("");

    // \save to backend or state management here if needed
  };

  const handleEditNote = (idx: number, newText: string) => {
    setNotes((prev) =>
      prev.map((n, i) => (i === idx ? { ...n, text: newText } : n))
    );

    // save edit action to backend or state management here if needed
  };

  const handleDeleteNote = (index: number) => {
  setNotes((prevNotes) => prevNotes.filter((_, i) => i !== index));
  // send delete action to backend or state management here if needed
  };

  const openSidebar = (title: string) => {
    setSidebarVisible(true);
    setActiveSection(title);
  };


  const SectionHeader = ({ title, icon: Icon }: { title: string; icon?: React.ElementType; }) => (
    <div className="flex items-center gap-2 group relative mb-4">
      {Icon && <Icon className="w-5 h-5 text-gray-500" />}
      <h4 className="text-lg font-semibold text-blue-900">{title}</h4>
      <button
        onClick={() => openSidebar(title)}
        className="opacity-0 group-hover:opacity-100 transition ml-1 p-1 rounded-full bg-gray-200 hover:bg-gray-300"
      >
        <Plus className="w-4 h-4 text-gray-700" />
      </button>
    </div>
  );

  return (
    <div className="relative flex gap-6">
      {/* Notes Toggle Button */}
      {notes.length > 0 && (
        <button
          onClick={() => setSidebarVisible(!sidebarVisible)}
          className="absolute top-0 right-0 p-2 bg-blue-600 text-white rounded-full shadow hover:bg-blue-700 transition"
        >
          {sidebarVisible ? <X className="w-4 h-4" /> : <StickyNote className="w-4 h-4" />}
        </button>
      )}

      {/* Main Candidate Card */}
      <div className="space-y-6 flex-1 max-w-4xl mx-auto">
        {/* Candidate Info */}
        <div className="p-6 bg-white rounded-lg shadow border border-gray-200">
          <h3 className="text-center text-xl font-semibold text-blue-900 mb-6">
            Candidate Information
          </h3>

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
        

        {/* Experience */}
        <div className="mt-4">
          <SectionHeader title="Experience" icon={Briefcase} />
          {result.experience?.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {result.experience.map((exp: any, idx: number) => (
                <div
                  key={idx}
                  className="border border-blue-200 rounded-md p-4 bg-white shadow-sm flex flex-col h-full"
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

        {/* Education */}
        <div className="mt-4">
          <SectionHeader title="Education" icon={BookOpen}/>
          {result.education?.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {result.education.map((edu: any, idx: number) => (
                <div
                  key={idx}
                  className="border border-blue-200 rounded-md p-4 bg-white shadow-sm flex flex-col h-full"
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

        {/* Skills */}
        <div className="mt-4">
          <SectionHeader title="Skills" icon={Zap} />
          {result.skills?.length ? (
            <div className="flex flex-wrap gap-2">
              {result.skills.map((s: string, idx: number) => (
                <span
                  key={idx}
                  className="flex items-center gap-1 bg-blue-100 text-gray-800 text-xs font-medium px-2 py-1 rounded-full 
                            transition-all duration-200 transform hover:bg-blue-200 hover:scale-105 cursor-pointer"
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

      {/* Notes Sidebar */}
      {sidebarVisible && notes.length > 0 || activeSection ? (
        <div className="w-50 bg-white rounded-lg shadow border border-gray-200 p-3 flex flex-col gap-3">
          <h4 className="font-semibold text-gray-800 mb-2">Notes</h4>

          <div className="flex flex-col gap-3">
            {/* Existing Notes */}
            {notes.map((note, idx) => (
              <div key={idx} className="p-2 bg-gray-50 border rounded shadow-sm relative flex flex-col gap-1">
                <p className="text-xs text-gray-500 uppercase">{note.section}</p>

                {/* Delete button */}
                <button
                  onClick={() => handleDeleteNote(idx)}
                  className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-100"
                  title="Delete note"
                >
                  <X className="w-3 h-3 text-red-500" />
                </button>

                <textarea
                  value={note.text}
                  onChange={(e) => handleEditNote(idx, e.target.value)}
                  className="w-full border rounded p-1 text-sm"
                />
              </div>
            ))}

            {/* New Note Card */}
            {activeSection && (
              <div className="p-2 bg-gray-50 border rounded shadow-sm flex flex-col gap-1 relative">
                <p className="text-xs text-gray-500 uppercase">{activeSection}</p>
                <textarea
                  value={tempNote}
                  onChange={(e) => setTempNote(e.target.value)}
                  className="w-full border rounded p-1 text-sm"
                />
                <div className="flex justify-end gap-2 mt-1">
                  <button
                    onClick={() => {
                      setActiveSection(null);
                      setTempNote("");
                    }}
                    className="px-2 py-1 text-xs bg-gray-200 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveNote}
                    className="px-2 py-1 text-xs bg-blue-600 text-white rounded"
                  >
                    Save
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}

    </div>
  );
};



export default JobPostingCarousel; ProjectInfoCard; SocialMediaCarousel; WorldCheckCard; DocumentExtractionResult;