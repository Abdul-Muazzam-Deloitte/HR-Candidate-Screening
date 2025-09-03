import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, Send, AlertTriangle, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { useScreening } from '../../contexts/ScreeningContext';
import { Answer, Question } from '../../types';

export const InterviewScreen: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { sessions, updateSessionStatus } = useScreening();
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [interviewQuestions, setInterviewQuestions] = useState<Question[]>([]);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [page, setPage] = useState(0); // pagination state
  const pageSize = 10; // how many question buttons per page

  const session = sessions.find(s => s.id === sessionId);
  const questions = session?.questions?.questions || [];
  const currentQuestion = questions[currentQuestionIndex];

  // Initialize timer
  useEffect(() => {
    if (!session?.questions?.interview_duration) return;

      const initialQuestions = questions.map(q => ({
        ...q,
        answer: q.answer || undefined,
      }));

      setInterviewQuestions(initialQuestions);

    const durationParts = session.questions.interview_duration.split(' ');
    const minutes = parseInt(durationParts[0]) || 60;
    setTimeLeft(minutes * 60);
  }, [session]);

  // Countdown
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Update answer directly on currentQuestion object
  const handleAnswerChange = (value: string) => {
    if (currentQuestion) {
      console.log("updating answer")
      currentQuestion.answer = value;
      setInterviewQuestions(prev =>
        prev.map(q =>
          q.id === currentQuestion.id
            ? {
                ...q,
                answer: value,
                submittedAt: new Date(),
              }
            : q
        )
      ); // trigger re-render
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      // auto-adjust page when moving forward
      if (nextIndex >= (page + 1) * pageSize) {
        setPage(p => p + 1);
      }
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      const prevIndex = currentQuestionIndex - 1;
      setCurrentQuestionIndex(prevIndex);
      // auto-adjust page when moving back
      if (prevIndex < page * pageSize) {
        setPage(p => Math.max(p - 1, 0));
      }
    }
  };

  const handleSubmit = async () => {
    if (!session) return;
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    updateSessionStatus(session.id, 'interview_completed');
    navigate(`/interview-completed/${sessionId}`);
  };

  const getQuestionTypeColor = (type: Question['type']) => {
    switch (type) {
      case 'technical': return 'bg-blue-100 text-blue-800';
      case 'behavioral': return 'bg-green-100 text-green-800';
      case 'situational': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyColor = (difficulty: Question['difficulty']) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!session || !currentQuestion) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Interview Not Found</h2>
          <p className="text-gray-600">The interview session could not be found.</p>
        </div>
      </div>
    );
  }

  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const isTimeRunningOut = timeLeft <= 60;

  // pagination calculations
  const totalPages = Math.ceil(questions.length / pageSize);
  const startIndex = page * pageSize;
  const endIndex = Math.min(startIndex + pageSize, questions.length);
  const visibleQuestions = questions.slice(startIndex, endIndex);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                Interview - {session.candidate.name}
              </h1>
              <p className="text-sm text-gray-500">
                Question {currentQuestionIndex + 1} of {questions.length}
              </p>
            </div>

            <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${
              isTimeRunningOut ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
            }`}>
              <Clock className="w-4 h-4" />
              <span className="font-medium">{formatTime(timeLeft)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          {/* Question Tags */}
          <div className="flex items-center space-x-2 mb-6">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getQuestionTypeColor(currentQuestion.type)}`}>
              {currentQuestion.type.charAt(0).toUpperCase() + currentQuestion.type.slice(1)}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(currentQuestion.difficulty)}`}>
              {currentQuestion.difficulty.charAt(0).toUpperCase() + currentQuestion.difficulty.slice(1)}
            </span>
          </div>

          {/* Question */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Question {currentQuestionIndex + 1}
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              {currentQuestion.question}
            </p>
          </div>

          {/* Answer Input */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Answer
            </label>
            <textarea
              rows={8}
              value={currentQuestion.answer || ''}
              onChange={(e) => handleAnswerChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Type your answer here..."
            />
          </div>

          {/* Navigation */}
          <div className="flex flex-col items-center space-y-4">
            {/* Prev/Next buttons */}
            <div className="flex items-center justify-between w-full">
              <button
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  currentQuestionIndex === 0
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-700 hover:bg-gray-50 border border-gray-300'
                }`}
              >
                Previous
              </button>

              {isLastQuestion ? (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors font-medium disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? 'Submitting...' : 'Submit Interview'}</span>
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium"
                >
                  Next
                </button>
              )}
            </div>

            {/* Question Pagination */}
            <div className="flex flex-col items-center space-y-2">
              <div className="flex items-center space-x-2">
                {visibleQuestions.map((_, index) => {
                  const questionIndex = startIndex + index;
                  return (
                    <button
                      key={questionIndex}
                      onClick={() => setCurrentQuestionIndex(questionIndex)}
                      className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                        questionIndex === currentQuestionIndex
                          ? 'bg-blue-600 text-white'
                          : interviewQuestions[questionIndex]?.answer
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {interviewQuestions[questionIndex]?.answer ? (
                        <CheckCircle className="w-4 h-4 mx-auto" />
                      ) : (
                        questionIndex + 1
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Pagination Controls */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPage(p => Math.max(p - 1, 0))}
                  disabled={page === 0}
                  className="px-2 py-1 rounded bg-gray-200 disabled:opacity-50"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-sm">
                  Page {page + 1} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(p + 1, totalPages - 1))}
                  disabled={page === totalPages - 1}
                  className="px-2 py-1 rounded bg-gray-200 disabled:opacity-50"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
