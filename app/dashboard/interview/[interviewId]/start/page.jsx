"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { toast } from "sonner";

function StartInterview({ params }) {
  const [interviewData, setInterviewData] = useState();
  const [mockInterviewQuestion, setMockInterviewQuestion] = useState([]);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [userAnswers, setUserAnswers] = useState({});

  useEffect(() => {
    GetInterviewDetail();
  }, []);

  /**
   * Used to Get Interview Details by MockId/Interview Id
   */
  const GetInterviewDetail = async () => {
    try {
      setLoading(true);
      console.log("Fetching interview with ID:", params.interviewId);
      
      // Import the database dependencies dynamically to avoid SSR issues
      const { db } = await import("@/utils/db");
      const { MockInterview } = await import("@/utils/schema");
      const { eq } = await import("drizzle-orm");
      
      const result = await db
        .select()
        .from(MockInterview)
        .where(eq(MockInterview.mockId, params.interviewId));

      console.log("Database query result:", result);

      if (result && result.length > 0) {
        console.log("Found interview data:", result[0]);
        console.log("Raw jsonMockResp:", result[0]?.jsonMockResp);
        
        if (result[0]?.jsonMockResp) {
          try {
            const jsonMockResp = JSON.parse(result[0].jsonMockResp);
            console.log("Parsed questions:", jsonMockResp);
            // Fix: Extract the questions array from the parsed JSON
            const questionsArray = jsonMockResp.questions || jsonMockResp || [];
            console.log("Questions array:", questionsArray);
            setMockInterviewQuestion(questionsArray);
            setInterviewData(result[0]);
          } catch (parseError) {
            console.error("Error parsing JSON:", parseError);
            setError("Error parsing interview questions");
          }
        } else {
          setError("Interview questions not found in database");
        }
      } else {
        setError("Interview not found with ID: " + params.interviewId);
      }
    } catch (err) {
      console.error("Error fetching interview details:", err);
      setError("Failed to load interview details: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Load saved answer for current question
  useEffect(() => {
    const savedAnswer = userAnswers[activeQuestionIndex] || "";
    setUserAnswer(savedAnswer);
  }, [activeQuestionIndex, userAnswers]);

  const SaveUserAnswer = async () => {
    if (userAnswer.length < 10) {
      toast("Please provide a more detailed answer (at least 10 characters)");
      return;
    }

    try {
      // Save answer locally first
      setUserAnswers(prev => ({
        ...prev,
        [activeQuestionIndex]: userAnswer
      }));

      // Save to database
      const { db } = await import("@/utils/db");
      const { UserAnswer } = await import("@/utils/schema");
      const { useUser } = await import("@clerk/nextjs");
      const moment = await import("moment");

      // For now, we'll save without AI feedback (can be added later)
      await db.insert(UserAnswer).values({
        mockIdRef: interviewData?.mockId,
        question: mockInterviewQuestion[activeQuestionIndex]?.question,
        correctAns: mockInterviewQuestion[activeQuestionIndex]?.answer,
        userAns: userAnswer,
        feedback: "Feedback will be generated during review",
        rating: "Pending",
        userEmail: "user@example.com", // This should come from Clerk
        createdAt: moment.default().format('DD-MM-yyyy')
      });

      toast("Answer saved successfully!");
    } catch (err) {
      console.error("Error saving answer:", err);
      toast("Error saving answer. Please try again.");
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center p-20">Loading interview...</div>;
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center p-20">
        <h2 className="text-red-600 mb-4">Error: {error}</h2>
        <Link href="/dashboard">
          <Button>Back to Dashboard</Button>
        </Link>
      </div>
    );
  }
  return (
    <div className="p-5">
      <div className="mb-10">
        <h1 className="text-2xl font-bold mb-4">Interview Started</h1>
        <p>Interview ID: {params.interviewId}</p>
        <p>Questions loaded: {mockInterviewQuestion?.length || 0}</p>
        <p>Current question: {activeQuestionIndex + 1}</p>
      </div>

      {mockInterviewQuestion && mockInterviewQuestion.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Questions Section */}
          <div className="mb-10">
            <div className="p-5 border rounded-lg">
              <h2 className="font-semibold mb-4">
                Question {activeQuestionIndex + 1} of {mockInterviewQuestion.length}
              </h2>
              <p className="text-lg mb-4">
                <strong>Q:</strong> {mockInterviewQuestion[activeQuestionIndex]?.question}
              </p>
            </div>
          </div>

          {/* Answer Section */}
          <div className="mb-10">
            <div className="p-5 border rounded-lg">
              <h2 className="font-semibold mb-4">Your Answer:</h2>
              <Textarea
                placeholder="Type your answer here..."
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                className="min-h-[200px] mb-4"
              />
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  {userAnswer.length} characters
                </span>
                <Button 
                  onClick={SaveUserAnswer} 
                  disabled={userAnswer.length < 10}
                  variant="outline"
                >
                  Save Answer
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end gap-4">
        {activeQuestionIndex > 0 && (
          <Button 
            onClick={() => setActiveQuestionIndex(activeQuestionIndex - 1)}
          >
            Previous Question
          </Button>
        )}

        {activeQuestionIndex < (mockInterviewQuestion?.length - 1) && (
          <Button 
            onClick={() => setActiveQuestionIndex(activeQuestionIndex + 1)}
          >
            Next Question
          </Button>
        )}

        {activeQuestionIndex === (mockInterviewQuestion?.length - 1) && (
          <Link href={`/dashboard/interview/${interviewData?.mockId}/feedback`}>
            <Button>End Interview</Button>
          </Link>
        )}
      </div>
    </div>
  );
}

export default StartInterview;
