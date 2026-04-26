import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Quiz from "./pages/Quiz";
import Directory from "./pages/Directory";
import ToolDetails from "./pages/ToolDetails";
import Paths from "./pages/Paths";
import PathDetails from "./pages/PathDetails";
import Articles from "./pages/Articles";
import ArticleDetails from "./pages/ArticleDetails";
import LessonView from "./pages/LessonView";
import CoursesListing from "./pages/CoursesListing";
import CourseDetails from "./pages/CourseDetails";
import ContentLibrary from "./pages/ContentLibrary";
import Recommendations from "./pages/Recommendations";
import SectionListing from "./pages/SectionListing";
import NotFound from "./pages/NotFound";

// Admin
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageTools from "./pages/admin/ManageTools";
import ManageArticles from "./pages/admin/ManageArticles";
import ManageContent from "./pages/admin/ManageContent";
import ManageCourses from "./pages/admin/ManageCourses";
import CourseBuilder from "./pages/admin/CourseBuilder";
import ManagePaths from "./pages/admin/ManagePaths";
import PathBuilder from "./pages/admin/PathBuilder";
import AdminSettings from "./pages/admin/AdminSettings";
import ManagePlatformSections from "./pages/admin/ManagePlatformSections";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <HashRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tools" element={<Directory />} />
          <Route path="/tool/:handle" element={<ToolDetails />} />
          <Route path="/paths" element={<Paths />} />
          <Route path="/paths/:slug" element={<PathDetails />} />
          <Route path="/paths/:slug/lesson/:lessonId" element={<LessonView />} />
          <Route path="/courses" element={<CoursesListing />} />
          <Route path="/courses/:id" element={<CourseDetails />} />
          <Route path="/courses/:id/lesson/:lessonId" element={<LessonView />} />
          <Route path="/articles" element={<Articles />} />
          <Route path="/article/:slug" element={<ArticleDetails />} />
          <Route path="/content" element={<ContentLibrary />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/recommendations" element={<Recommendations />} />
          <Route path="/section/:id" element={<SectionListing />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="tools" element={<ManageTools />} />
            <Route path="articles" element={<ManageArticles />} />
            <Route path="content" element={<ManageContent />} />
            <Route path="courses" element={<ManageCourses />} />
            <Route path="courses/:id/builder" element={<CourseBuilder />} />
            <Route path="paths" element={<ManagePaths />} />
            <Route path="paths/:slug/builder" element={<PathBuilder />} />
            <Route path="sections" element={<ManagePlatformSections />} />
            
            {/* Dynamic Custom Standalone Modules Routes */}
            <Route path="sections/:sectionId/manage-tools" element={<ManageTools />} />
            <Route path="sections/:sectionId/manage-articles" element={<ManageArticles />} />
            <Route path="sections/:sectionId/manage-courses" element={<ManageCourses />} />
            <Route path="sections/:sectionId/courses/:id/builder" element={<CourseBuilder />} />
            <Route path="sections/:sectionId/manage-paths" element={<ManagePaths />} />
            <Route path="sections/:sectionId/paths/:slug/builder" element={<PathBuilder />} />
            
            <Route path="settings" element={<AdminSettings />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </HashRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
