"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Send, Star } from "lucide-react";
import { AnimatedGridPattern } from "./magicui/animated-grid-pattern";
import { cn } from "@/lib/utils";

interface FeedbackFormProps {
  className?: string;
}

const FeedbackForm: React.FC<FeedbackFormProps> = ({ className }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    rating: 0,
    feedback: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRatingClick = (rating: number) => {
    setFormData((prev) => ({
      ...prev,
      rating,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    // Validate form
    if (
      !formData.name ||
      !formData.email ||
      !formData.feedback ||
      formData.rating === 0
    ) {
      setError("Please fill all required fields");
      setSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit feedback");
      }
  
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || "An error occurred while submitting your feedback");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative w-full max-w-3xl mx-auto">

      <div className="relative z-10 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="bg-primary py-6 px-8">
          <h2 className="text-2xl font-bold text-white">Share Your Feedback</h2>
          <p className="text-blue-100 mt-2">
            Help us improve IskoChat by sharing your experience
          </p>
        </div>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2">
                Your Name <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                placeholder="Enter your name"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                placeholder="your.email@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-3">
                Rate Your Experience <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => handleRatingClick(rating)}
                    className={`p-2 rounded-full transition-all ${
                      formData.rating >= rating
                        ? "text-secondary bg-secondary/10"
                        : "text-gray-400 hover:text-secondary"
                    }`}
                    aria-label={`Rate ${rating} stars`}
                  >
                    <Star
                      className={`w-8 h-8 ${
                        formData.rating >= rating
                          ? "fill-secondary"
                          : "fill-none"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label
                htmlFor="feedback"
                className="block text-sm font-medium mb-2"
              >
                Your Feedback <span className="text-red-500">*</span>
              </label>
              <textarea
                id="feedback"
                name="feedback"
                required
                value={formData.feedback}
                onChange={handleChange}
                rows={5}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"
                placeholder="Please share your thoughts about IskoChat..."
              />
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="w-full"
              size="lg"
            >
              {submitting ? (
                <>Processing...</>
              ) : (
                <>
                  <Send className="w-5 h-5 mr-2" />
                  Submit Feedback
                </>
              )}
            </Button>
          </form>
        ) : (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-bold mb-2">Thank You!</h3>
            <p className="text-gray-600 mb-6">
              Your feedback has been successfully submitted. We appreciate your
              input!
            </p>
            <Button
              onClick={() => {
                setSubmitted(false);
                setFormData({ name: "", email: "", rating: 0, feedback: "" });
              }}
              variant="outline"
            >
              Submit Another Response
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedbackForm;
