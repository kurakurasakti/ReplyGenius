"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SectionWrapper } from "../section-wrapper";
import Link from "next/link";

export function HeroSection() {
  return (
    <SectionWrapper>
      <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center space-y-8">
            {/* Main Heading */}
            <div className="space-y-4">
              <h1 className="font-heading text-5xl md:text-7xl font-bold text-foreground leading-tight">
                Automate Your
                <span className="text-primary block">Customer Service</span>
              </h1>
              <p className="font-sans text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                AI-powered chat automation for Tokopedia and Shopee sellers.
                Save hours every day, respond faster, and focus on growing your
                business.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/auth/sign-up" passHref>
                <Button size="lg" className="text-lg px-8 py-6 h-auto">
                  Start Free Trial
                </Button>
              </Link>
              <Button
                variant="outline"
                size="lg"
                className="text-lg px-8 py-6 h-auto"
              >
                Watch Demo
              </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-4xl mx-auto">
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardContent className="p-6 text-center">
                  <div className="font-heading text-3xl font-bold text-primary mb-2">
                    80%
                  </div>
                  <p className="font-sans text-muted-foreground">
                    Time Saved on Repetitive Chats
                  </p>
                </CardContent>
              </Card>
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardContent className="p-6 text-center">
                  <div className="font-heading text-3xl font-bold text-primary mb-2">
                    24/7
                  </div>
                  <p className="font-sans text-muted-foreground">
                    Instant Customer Support
                  </p>
                </CardContent>
              </Card>
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardContent className="p-6 text-center">
                  <div className="font-heading text-3xl font-bold text-primary mb-2">
                    10+
                  </div>
                  <p className="font-sans text-muted-foreground">
                    Hours Saved Per Week
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
