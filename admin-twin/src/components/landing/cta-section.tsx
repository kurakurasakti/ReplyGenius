"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SectionWrapper } from "../section-wrapper";

export function CTASection() {
  return (
    <SectionWrapper className="py-20 bg-primary/5">
      <div className="container mx-auto px-4">
        <Card className="border-primary/20 bg-gradient-to-r from-primary/10 to-primary/5 backdrop-blur-sm">
          <CardContent className="p-12 text-center">
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-6">
              Ready to Transform Your Customer Service?
            </h2>
            <p className="font-sans text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join hundreds of Indonesian e-commerce sellers who are already
              saving hours every day with AI-powered customer service
              automation.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <Button size="lg" className="text-lg px-8 py-6 h-auto">
                Start Free Trial - No Credit Card Required
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="text-lg px-8 py-6 h-auto"
              >
                Schedule a Demo
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="font-heading text-2xl font-bold text-primary mb-2">
                  Free Trial
                </div>
                <p className="font-sans text-sm text-muted-foreground">
                  14 days free, no setup fees
                </p>
              </div>
              <div className="text-center">
                <div className="font-heading text-2xl font-bold text-primary mb-2">
                  Easy Setup
                </div>
                <p className="font-sans text-sm text-muted-foreground">
                  Connect in under 5 minutes
                </p>
              </div>
              <div className="text-center">
                <div className="font-heading text-2xl font-bold text-primary mb-2">
                  Cancel Anytime
                </div>
                <p className="font-sans text-sm text-muted-foreground">
                  No long-term contracts
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </SectionWrapper>
  );
}
