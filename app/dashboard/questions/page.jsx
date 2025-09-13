"use client";
import React, { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Download, Plus, Search, BookOpen, Filter } from 'lucide-react'

function QuestionsPage() {
  const { user } = useUser();
  const [questions, setQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newQuestion, setNewQuestion] = useState({ question: '', answer: '', category: '' });

  useEffect(() => {
    fetchQuestions();
  }, [user]);

  useEffect(() => {
    filterQuestions();
  }, [questions, searchTerm, selectedCategory]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const { db } = await import("@/utils/db");
      const { MockInterview } = await import("@/utils/schema");
      const { eq } = await import("drizzle-orm");
      
      const result = await db
        .select()
        .from(MockInterview)
        .where(eq(MockInterview.createdBy, user?.primaryEmailAddress?.emailAddress));

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
                createdAt: interview.createdAt,
                interviewId: interview.mockId
              });
            });
          } catch (e) {
            console.error('Error parsing questions:', e);
          }
        }
      });

      setQuestions(allQuestions);
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterQuestions = () => {
    let filtered = questions;

    if (searchTerm) {
      filtered = filtered.filter(q => 
        q.question?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.jobPosition?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(q => q.jobPosition === selectedCategory);
    }

    setFilteredQuestions(filtered);
  };

  const getUniqueCategories = () => {
    const categories = [...new Set(questions.map(q => q.jobPosition).filter(Boolean))];
    return categories;
  };

  const exportQuestions = () => {
    const questionsToExport = filteredQuestions.map(q => ({
      question: q.question,
      answer: q.answer,
      category: q.jobPosition,
      date: q.createdAt
    }));

    const dataStr = JSON.stringify(questionsToExport, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'interview_questions.json';
    link.click();
  };

  const createCustomQuestion = async () => {
    if (!newQuestion.question.trim() || !newQuestion.answer.trim()) {
      alert('Please fill in both question and answer');
      return;
    }

    try {
      // Save custom question to database as a special MockInterview entry
      const { db } = await import("@/utils/db");
      const { MockInterview } = await import("@/utils/schema");
      const { v4: uuidv4 } = await import("uuid");
      const moment = await import("moment");

      const customQuestionData = {
        question: newQuestion.question,
        answer: newQuestion.answer
      };

      const jsonMockResp = JSON.stringify({
        questions: [customQuestionData]
      });

      await db.insert(MockInterview).values({
        mockId: uuidv4(),
        jsonMockResp: jsonMockResp,
        jobPosition: newQuestion.category || 'Custom',
        jobDesc: 'Custom question created by user',
        jobExperience: '0',
        createdBy: user?.primaryEmailAddress?.emailAddress,
        createdAt: moment.default().format('DD-MM-yyyy'),
      });

      // Refresh the questions list from database
      await fetchQuestions();
      
      setNewQuestion({ question: '', answer: '', category: '' });
      setShowCreateForm(false);
      
      alert('Custom question saved successfully!');
    } catch (error) {
      console.error('Error saving custom question:', error);
      alert('Failed to save custom question. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your questions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Questions Bank</h1>
        <div className="flex gap-3">
          <Button onClick={() => setShowCreateForm(true)} className="flex items-center gap-2">
            <Plus size={16} /> Add Custom Question
          </Button>
          <Button variant="outline" onClick={exportQuestions} className="flex items-center gap-2">
            <Download size={16} /> Export Questions
          </Button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <Input
              placeholder="Search questions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-600" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              {getUniqueCategories().map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Create Question Form */}
      {showCreateForm && (
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Create Custom Question</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Question</label>
              <Textarea
                placeholder="Enter your interview question..."
                value={newQuestion.question}
                onChange={(e) => setNewQuestion({...newQuestion, question: e.target.value})}
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Sample Answer</label>
              <Textarea
                placeholder="Enter a sample answer..."
                value={newQuestion.answer}
                onChange={(e) => setNewQuestion({...newQuestion, answer: e.target.value})}
                rows={4}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <Input
                placeholder="e.g., React Developer, Java, etc."
                value={newQuestion.category}
                onChange={(e) => setNewQuestion({...newQuestion, category: e.target.value})}
              />
            </div>
            <div className="flex gap-3">
              <Button onClick={createCustomQuestion}>Create Question</Button>
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>Cancel</Button>
            </div>
          </div>
        </div>
      )}

      {/* Questions List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <BookOpen size={20} />
            Your Questions ({filteredQuestions.length})
          </h2>
        </div>

        {filteredQuestions.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
            <BookOpen size={48} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No questions found</h3>
            <p className="text-gray-500 mb-4">
              {questions.length === 0 
                ? "Start by creating your first interview to build your question bank." 
                : "Try adjusting your search or filter criteria."}
            </p>
            <a href="/dashboard" className="text-blue-600 hover:text-blue-700 font-medium">
              Create New Interview →
            </a>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredQuestions.map((q, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {q.jobPosition}
                  </span>
                  <span className="text-sm text-gray-500">{q.createdAt}</span>
                </div>
                <h3 className="font-semibold text-lg mb-3">{q.question}</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-700 mb-1">Sample Answer:</p>
                  <p className="text-gray-600">{q.answer}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-8">
        <a 
          href="/dashboard" 
          className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          ← Back to Dashboard
        </a>
      </div>
    </div>
  )
}

export default QuestionsPage
