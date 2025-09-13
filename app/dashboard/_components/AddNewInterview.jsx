"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { chatSession } from "@/utils/GeminiAIModel";
import { LoaderCircle } from "lucide-react";
import { db } from "@/utils/db";
import { MockInterview } from "@/utils/schema";
import { v4 as uuidv4 } from "uuid";
import { useUser } from "@clerk/nextjs";
import moment from "moment/moment";
import { useRouter } from "next/navigation";
import { eq } from "drizzle-orm";

function AddNewInterview() {
  const [openDialog, setOpenDialog] = useState(false);
  const [showManualMode, setShowManualMode] = useState(false);
  const [jobPosition, setJobPosition] = useState();
  const [jobDesc, setJobDesc] = useState();
  const [jobExperience, setJobExperience] = useState();
  const [loading, setLoading] = useState(false);
  const [JsonResponse, setJsonResponse] = useState([]);
  const [availableQuestions, setAvailableQuestions] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [customQuestion, setCustomQuestion] = useState({ question: '', answer: '' });
  const { user } = useUser();
  const route=useRouter()

  // Fetch available questions when entering manual mode
  const fetchAvailableQuestions = async () => {
    try {
      const result = await db.select().from(MockInterview).where(eq(MockInterview.createdBy, user?.primaryEmailAddress?.emailAddress));
      const allQuestions = [];
      result.forEach(interview => {
        if (interview.jsonMockResp) {
          try {
            const parsed = JSON.parse(interview.jsonMockResp);
            const questionsList = parsed.questions || parsed || [];
            questionsList.forEach(q => {
              allQuestions.push({
                ...q,
                jobPosition: interview.jobPosition,
                source: 'existing'
              });
            });
          } catch (e) {
            console.error('Error parsing questions:', e);
          }
        }
      });
      setAvailableQuestions(allQuestions);
    } catch (error) {
      console.error('Error fetching questions:', error);
    }
  };

  const createManualInterview = async () => {
    if (selectedQuestions.length === 0) {
      alert('Please select at least one question for the interview.');
      return;
    }

    try {
      setLoading(true);
      const mockJsonResp = JSON.stringify({ questions: selectedQuestions });

      const resp = await db.insert(MockInterview).values({
        mockId: uuidv4(),
        jsonMockResp: mockJsonResp,
        jobPosition: jobPosition,
        jobDesc: jobDesc + " (Manual Interview)",
        jobExperience: jobExperience,
        createdBy: user?.primaryEmailAddress?.emailAddress,
        createdAt: moment().format("DD-MM-yyyy"),
      }).returning({mockId:MockInterview.mockId});

      if(resp) {
        route.push('/dashboard/interview/' + resp[0].mockId);
        setOpenDialog(false);
        resetForm();
      }
    } catch (error) {
      console.error('Error creating manual interview:', error);
      alert('Failed to create interview. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setJobPosition('');
    setJobDesc('');
    setJobExperience('');
    setShowManualMode(false);
    setSelectedQuestions([]);
    setCustomQuestion({ question: '', answer: '' });
  };

  const addCustomQuestionToInterview = () => {
    if (!customQuestion.question.trim() || !customQuestion.answer.trim()) {
      alert('Please fill in both question and answer');
      return;
    }

    const newQuestion = {
      question: customQuestion.question,
      answer: customQuestion.answer,
      source: 'custom'
    };

    setSelectedQuestions(prev => [...prev, newQuestion]);
    setCustomQuestion({ question: '', answer: '' });
  };

  const toggleQuestionSelection = (question, index) => {
    const questionWithId = { ...question, id: `existing-${index}` };
    setSelectedQuestions(prev => {
      const exists = prev.find(q => q.id === questionWithId.id);
      if (exists) {
        return prev.filter(q => q.id !== questionWithId.id);
      }
      return [...prev, questionWithId];
    });
  };

  const onSubmit = async (e) => {
    setLoading(true);
    e.preventDefault();

    const InputPromt = `Generate ${process.env.NEXT_PUBLIC_INTERVIEW_QUESTION} interview questions and answers in JSON format based on the following: Job Position: ${jobPosition}, Job Description: ${jobDesc}, Years of Experience: ${jobExperience}. Only return the JSON, without any additional text.`;
    const result = await chatSession.sendMessage(InputPromt);
    const MockJsonResp = result.response
      .text()
      .replace("```json", "")
      .replace("```", "");
    //console.log(JSON.parse(MockJsonResp))
    setJsonResponse(JSON.parse(MockJsonResp));
   if(MockJsonResp){
    const resp = await db.insert(MockInterview).values({
        mockId: uuidv4(),
        jsonMockResp: MockJsonResp,
        jobPosition: jobPosition,
        jobDesc: jobDesc,
        jobExperience: jobExperience,
        createdBy: user?.primaryEmailAddress?.emailAddress,
        createdAt: moment().format("DD-MM-yyyy"),
      }).returning({mockId:MockInterview.mockId})
      console.log("Insert ID:", resp)
      if(resp){
       route.push('/dashboard/interview/'+resp[0].mockId)
        setOpenDialog(false)
      }
    

   }else{
    console.log("ERROR")
   }

   setLoading(false);
   console.log(JsonResponse)
   



  };

  return (
    <div>
      <div
        className="p-10 border rounded-lg bg-secondary hover:scale-105 hover:shadow-md cursor-pointer transition-all delay-100"
        onClick={() => setOpenDialog(true)}
      >
        <h2 className="text-lg text-center">+ Add new</h2>
      </div>
      <Dialog open={openDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {showManualMode ? "Create Interview Manually" : "Tell us more about your job interviewing"}
            </DialogTitle>
            <DialogDescription>
              {!showManualMode ? (
                <form onSubmit={onSubmit}>
                  <div>
                    <h2>Add Details about your job position/role, Job description and years of experience</h2>

                    <div className="mt-7 my-3">
                      <label>Job Role/Job Position</label>
                      <Input
                        onChange={(event) => setJobPosition(event.target.value)}
                        placeholder="Ex. Full Stack Developer"
                        required
                      />
                    </div>
                    <div className="mt-7 my-3">
                      <label>Job Description/Tech Stack (In Short)</label>
                      <Textarea
                        onChange={(event) => setJobDesc(event.target.value)}
                        placeholder="Ex. React, Angular, NodeJs, NextJs etc."
                        required
                      />
                    </div>
                    <div className="mt-7 my-3">
                      <label>Years of experience</label>
                      <Input
                        onChange={(event) => setJobExperience(event.target.value)}
                        placeholder="Ex. 5"
                        type="number"
                        max="50"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex gap-5 justify-end">
                    <Button type="button" variant="ghost" onClick={() => {setOpenDialog(false); resetForm();}}>
                      Cancel
                    </Button>
                    <Button type="button" variant="outline" onClick={() => {setShowManualMode(true); fetchAvailableQuestions();}}>
                      Create Manually
                    </Button>
                    <Button disabled={loading} type="submit">
                      {loading ? (
                        <>
                          <LoaderCircle className="animate-spin" /> Generating from AI
                        </>
                      ) : (
                        "Start Interview"
                      )}
                    </Button>
                  </div>
                </form>
              ) : (
                <div>
                  <h2>Select questions for your interview</h2>
                  
                  {/* Job Info (still needed for manual mode) */}
                  <div className="grid grid-cols-3 gap-4 mt-4 mb-6">
                    <div>
                      <label className="text-sm font-medium">Job Position</label>
                      <Input
                        value={jobPosition}
                        onChange={(e) => setJobPosition(e.target.value)}
                        placeholder="Ex. Developer"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Description</label>
                      <Input
                        value={jobDesc}
                        onChange={(e) => setJobDesc(e.target.value)}
                        placeholder="Tech stack"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Experience</label>
                      <Input
                        value={jobExperience}
                        onChange={(e) => setJobExperience(e.target.value)}
                        placeholder="5"
                        type="number"
                        required
                      />
                    </div>
                  </div>

                  {/* Selected Questions Summary */}
                  <div className="bg-blue-50 p-4 rounded-lg mb-4">
                    <h3 className="font-medium text-blue-800">Selected Questions: {selectedQuestions.length}</h3>
                    {selectedQuestions.length > 0 && (
                      <div className="mt-2">
                        {selectedQuestions.map((q, index) => (
                          <div key={index} className="text-sm text-blue-700 mb-1">
                            • {q.question.substring(0, 80)}...
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Add Custom Question */}
                  <div className="border rounded-lg p-4 mb-4">
                    <h3 className="font-medium mb-3">Add Custom Question</h3>
                    <div className="space-y-3">
                      <div>
                        <Textarea
                          placeholder="Enter your question..."
                          value={customQuestion.question}
                          onChange={(e) => setCustomQuestion({...customQuestion, question: e.target.value})}
                          rows={2}
                        />
                      </div>
                      <div>
                        <Textarea
                          placeholder="Enter the ideal answer..."
                          value={customQuestion.answer}
                          onChange={(e) => setCustomQuestion({...customQuestion, answer: e.target.value})}
                          rows={3}
                        />
                      </div>
                      <Button type="button" size="sm" onClick={addCustomQuestionToInterview}>
                        Add to Interview
                      </Button>
                    </div>
                  </div>

                  {/* Available Questions */}
                  <div className="border rounded-lg p-4 mb-4 max-h-60 overflow-y-auto">
                    <h3 className="font-medium mb-3">Choose from Existing Questions ({availableQuestions.length})</h3>
                    {availableQuestions.length === 0 ? (
                      <p className="text-gray-500 text-sm">No existing questions found. Add custom questions above.</p>
                    ) : (
                      <div className="space-y-2">
                        {availableQuestions.map((question, index) => {
                          const isSelected = selectedQuestions.some(q => q.id === `existing-${index}`);
                          return (
                            <div key={index} className={`p-3 rounded border cursor-pointer ${isSelected ? 'bg-blue-100 border-blue-300' : 'hover:bg-gray-50'}`}
                                 onClick={() => toggleQuestionSelection(question, index)}>
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <p className="text-sm font-medium">{question.question}</p>
                                  <p className="text-xs text-gray-500 mt-1">{question.jobPosition}</p>
                                </div>
                                <div className="text-xs">
                                  {isSelected ? '✓' : '+'}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3 justify-end">
                    <Button type="button" variant="ghost" onClick={() => {setOpenDialog(false); resetForm();}}>
                      Cancel
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setShowManualMode(false)}>
                      Back to AI Mode
                    </Button>
                    <Button 
                      disabled={selectedQuestions.length === 0 || loading || !jobPosition || !jobDesc || !jobExperience} 
                      onClick={createManualInterview}
                    >
                      {loading ? (
                        <>
                          <LoaderCircle className="animate-spin" /> Creating...
                        </>
                      ) : (
                        `Create Interview (${selectedQuestions.length} questions)`
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AddNewInterview;
