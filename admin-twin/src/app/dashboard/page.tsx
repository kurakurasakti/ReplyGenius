"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("integration");

  // Mock data for development
  const [connectionStatus, setConnectionStatus] = useState({
    shopee: false,
    tiktokshop: false,
  });

  const [uploadedFiles, setUploadedFiles] = useState(0);
  const [aiResponses, setAiResponses] = useState([
    {
      id: 1,
      query: "Kapan pesanan saya dikirim?",
      response:
        "Pesanan Anda akan dikirim dalam 1-2 hari kerja. Kami akan mengirimkan nomor resi setelah barang dikirim.",
      confidence: 95,
      status: "approved",
    },
    {
      id: 2,
      query: "Apakah masih ada stok?",
      response:
        "Stok produk ini masih tersedia. Silakan langsung order untuk memastikan ketersediaan.",
      confidence: 88,
      status: "pending",
    },
  ]);

  const tabItems = [
    { id: "integration", label: "API Integration", icon: "🔗" },
    { id: "training", label: "Chat Training", icon: "📚" },
    { id: "management", label: "AI Management", icon: "🤖" },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "integration":
        return (
          <div className="space-y-6">
            <motion.div
              className="grid gap-6 md:grid-cols-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, staggerChildren: 0.1 }}
            >
              {/* Shopee Integration */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                whileHover={{ scale: 1.02 }}
                className="transform-gpu"
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <span className="text-orange-500">🛍️</span>
                      Shopee Integration
                    </CardTitle>
                    <CardDescription>
                      Connect your Shopee store to automate customer service
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Connection Status</span>
                      <Badge
                        variant={
                          connectionStatus.shopee ? "default" : "secondary"
                        }
                      >
                        {connectionStatus.shopee
                          ? "Connected"
                          : "Not Connected"}
                      </Badge>
                    </div>
                    <Button
                      onClick={() =>
                        setConnectionStatus((prev) => ({
                          ...prev,
                          shopee: !prev.shopee,
                        }))
                      }
                      className="w-full"
                    >
                      {connectionStatus.shopee
                        ? "Disconnect"
                        : "Connect Shopee"}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>

              {/* TikTok Shop Integration */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="transform-gpu"
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <span className="text-red-500">📱</span>
                      TikTok Shop Integration
                    </CardTitle>
                    <CardDescription>
                      Connect your TikTok Shop to automate customer service
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Connection Status</span>
                      <Badge
                        variant={
                          connectionStatus.tiktokshop ? "default" : "secondary"
                        }
                      >
                        {connectionStatus.tiktokshop
                          ? "Connected"
                          : "Not Connected"}
                      </Badge>
                    </div>
                    <Button
                      onClick={() =>
                        setConnectionStatus((prev) => ({
                          ...prev,
                          tiktokshop: !prev.tiktokshop,
                        }))
                      }
                      className="w-full"
                    >
                      {connectionStatus.tiktokshop
                        ? "Disconnect"
                        : "Connect TikTok Shop"}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          </div>
        );

      case "training":
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Upload Chat History</CardTitle>
                <CardDescription>
                  Upload your historical chat data to train the AI agent
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <div className="space-y-2">
                    <div className="text-4xl">📁</div>
                    <div className="text-lg font-medium">
                      Drop your chat files here
                    </div>
                    <div className="text-sm text-gray-500">
                      Supports .csv, .json, .xlsx files up to 10MB
                    </div>
                  </div>
                  <Button className="mt-4">Choose Files</Button>
                </div>

                <div className="flex items-center justify-between">
                  <span>Files Uploaded</span>
                  <Badge>{uploadedFiles} files</Badge>
                </div>

                {uploadedFiles > 0 && (
                  <Button
                    className="w-full"
                    onClick={() => console.log("Starting AI training...")}
                  >
                    Start AI Training
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        );

      case "management":
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>AI Response Previews</CardTitle>
                <CardDescription>
                  Review and approve AI-generated responses before deployment
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {aiResponses.map((response) => (
                    <div
                      key={response.id}
                      className="border rounded-lg p-4 space-y-3"
                    >
                      <div>
                        <div className="font-medium text-sm text-gray-500">
                          Customer Query:
                        </div>
                        <div>{response.query}</div>
                      </div>
                      <div>
                        <div className="font-medium text-sm text-gray-500">
                          AI Response:
                        </div>
                        <div>{response.response}</div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">Confidence:</span>
                          <Badge variant="outline">
                            {response.confidence}%
                          </Badge>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                          <Button size="sm">Approve</Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold font-heading">
              ReplyGenius Dashboard
            </h1>
            <div className="flex items-center gap-4">
              <Badge variant="outline">Free Plan</Badge>
              <Button variant="outline" size="sm">
                Settings
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Tab Navigation */}
        <div className="relative flex mb-8 bg-gray-900/50 p-1.5 rounded-xl border border-gray-800">
          {tabItems.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? "text-white z-10"
                  : "text-gray-400 hover:text-gray-200 hover:scale-105"
              }`}
            >
              {/* Animated Background */}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-white/10 rounded-lg shadow-lg border border-white/20"
                  initial={false}
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 30,
                  }}
                />
              )}

              {/* Icon with animation */}
              <motion.span
                className="text-lg"
                animate={{
                  scale: activeTab === tab.id ? 1.1 : 1,
                  rotate: activeTab === tab.id ? [0, -10, 10, 0] : 0,
                }}
                transition={{
                  duration: 0.3,
                  ease: "easeInOut",
                }}
              >
                {tab.icon}
              </motion.span>

              {/* Label with animation */}
              <motion.span
                animate={{
                  fontWeight: activeTab === tab.id ? 600 : 500,
                }}
                transition={{ duration: 0.2 }}
              >
                {tab.label}
              </motion.span>

              {/* Active indicator dot */}
              {activeTab === tab.id && (
                <motion.div
                  className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 20,
                    delay: 0.1,
                  }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content with Animation */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{
              duration: 0.3,
              ease: "easeInOut",
            }}
          >
            {renderTabContent()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
