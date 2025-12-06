import React from "react";
import Navigation from "../Navigation/Navigation";
import Footer from "../../Footer/Footer";

const About = () => {
  return (
        <>
    <Navigation />
    <div className="bg-white min-h-screen">
      {/* 1. Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        {/* 2. Hero / Intro Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight sm:text-5xl">
            About Our Mission
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-slate-600">
            We are building the future of authentication and user management.
            Simple, secure, and elegant.
          </p>
        </div>

        {/* 3. Two-Column Layout: Story & Visual */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column: Text Content */}
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-6">
              Driving Innovation
            </h2>
            <div className="space-y-6 text-lg text-slate-600 leading-relaxed">
              <p>
                This application serves as a demonstration of robust security
                practices combined with modern frontend architecture. We believe
                that great software starts with a solid foundation.
              </p>
              <p>
                By leveraging Firebase and React, we provide a seamless
                experience that scales with your needs. Our focus is on speed,
                reliability, and user-centric design.
              </p>
            </div>
          </div>

          {/* Right Column: Visual Placeholder */}
          {/* Replace the gradient div below with an <img /> tag when you have one */}
          <div className="relative">
            <div className="absolute inset-0 bg-indigo-600 blur-2xl opacity-20 rounded-full"></div>
            <div className="relative bg-slate-50 rounded-2xl border border-slate-200 shadow-xl p-8 h-80 flex items-center justify-center">
              <span className="text-slate-400 font-medium">
                [ Placeholder for Team or Office Image ]
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Stats / Credibility Section */}
      <div className="bg-slate-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-white">100%</div>
              <div className="mt-2 text-indigo-200">Secure</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white">24/7</div>
              <div className="mt-2 text-indigo-200">Uptime</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white">Global</div>
              <div className="mt-2 text-indigo-200">Community</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <Footer />
    </>
  );
};

export default About;
