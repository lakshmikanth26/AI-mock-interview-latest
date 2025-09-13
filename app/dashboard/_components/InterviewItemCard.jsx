"use client";
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import React from 'react'

function InterviewItemCard({interviewInfo}) {
   const router=useRouter()
    
    const onStart=()=>{
        try {
            console.log("=== START BUTTON CLICKED ===");
            console.log("Interview info:", interviewInfo);
            console.log("Mock ID:", interviewInfo?.mockId);
            
            if (!interviewInfo?.mockId) {
                console.error("No mockId found!");
                alert("Error: Interview ID not found");
                return;
            }
            
            const url = `/dashboard/interview/${interviewInfo.mockId}`;
            console.log("Navigating to URL:", url);
            
            // Test the router
            console.log("Router object:", router);
            router.push(url);
            console.log("Router.push called successfully");
        } catch (error) {
            console.error("Error in onStart:", error);
            alert("Error starting interview: " + error.message);
        }
    }
    
    const onFeedback=()=>{
        try {
            console.log("=== FEEDBACK BUTTON CLICKED ===");
            console.log("Mock ID:", interviewInfo?.mockId);
            
            if (!interviewInfo?.mockId) {
                console.error("No mockId found!");
                alert("Error: Interview ID not found");
                return;
            }
            
            const url = `/dashboard/interview/${interviewInfo.mockId}/feedback`;
            console.log("Navigating to URL:", url);
            router.push(url);
            console.log("Router.push called successfully");
        } catch (error) {
            console.error("Error in onFeedback:", error);
            alert("Error viewing feedback: " + error.message);
        }
    }
  return (
    <div className='border shadow-sm rounded-lg p-3' style={{pointerEvents: 'auto'}}>
        <h2 className='font-bold text-primary'>{interviewInfo?.jobPosition}</h2>
        <h2 className='text-sm text-gray-600'>{interviewInfo?.jobExperience} Years of Experience</h2>
        <h2 className='text-xs text-gray-500'>Created At: {interviewInfo.createdAt}</h2>
        
        
        <div className='flex justify-between mt-2 gap-5'>
            <Button size="sm" variant="outline" className="w-full" onClick={onFeedback}>
                Feedback
            </Button>
            <Button size="sm" className="w-full" onClick={onStart}>
                Start
            </Button>
        </div>
    </div>
  )
}

export default InterviewItemCard