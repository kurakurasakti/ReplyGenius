"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SectionWrapper } from "../section-wrapper";

const features = [
  {
    title: "AI-Powered Responses",
    description:
      "Our AI learns from your chat history to provide human-like, context-aware responses that match your brand voice.",
    icon: "🤖",
    badge: "Core Feature",
  },
  {
    title: "Platform Integration",
    description:
      "Seamless integration with Tokopedia and Shopee APIs. No coding required - just connect your accounts.",
    icon: "🔗",
    badge: "Easy Setup",
  },
  {
    title: "Smart Automation",
    description:
      "Automatically handles repetitive queries about order status, shipping, and product details.",
    icon: "⚡",
    badge: "Time Saver",
  },
  {
    title: "Human Oversight",
    description:
      "Review and approve AI responses before they're sent. Stay in control while saving time.",
    icon: "👁️",
    badge: "Safe",
  },
  {
    title: "Multi-Language Support",
    description:
      "Supports Bahasa Indonesia, English, and local dialects. Perfect for Indonesia's diverse market.",
    icon: "🌏",
    badge: "Localized",
  },
  {
    title: "Analytics & Insights",
    description:
      "Track response times, customer satisfaction, and identify areas for improvement.",
    icon: "📊",
    badge: "Analytics",
  },
];

export function FeaturesSection() {
  return (
    <SectionWrapper className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-6">
            Why Choose ReplyGenius?
          </h2>
          <p className="font-sans text-xl text-muted-foreground max-w-3xl mx-auto">
            Stop wasting time on repetitive customer service tasks. Let AI
            handle the routine while you focus on growing your business.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300"
            >
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-4xl">{feature.icon}</span>
                  <Badge variant="secondary" className="text-xs">
                    {feature.badge}
                  </Badge>
                </div>
                <CardTitle className="font-heading text-xl font-semibold">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="font-sans text-muted-foreground leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
