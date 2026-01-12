import { useState } from "react";
import { Plus, Pencil, Trash2, Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useOrg } from "@/contexts/OrgContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface FaqItem {
  id: string;
  category: string | null;
  question: string;
  answer: string;
  active: boolean;
  created_at: string;
}

export default function KnowledgeBasePage() {
  const { currentOrg, userRole } = useOrg();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FaqItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [formData, setFormData] = useState({
    category: "",
    question: "",
    answer: "",
    active: true,
  });

  const { data: faqs, isLoading } = useQuery({
    queryKey: ["faq-kb", currentOrg?.id],
    queryFn: async () => {
      if (!currentOrg) return [];
      const { data, error } = await supabase
        .from("faq_kb")
        .select("*")
        .eq("org_id", currentOrg.id)
        .order("category")
        .order("question");
      if (error) throw error;
      return data as FaqItem[];
    },
    enabled: !!currentOrg,
  });

  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (!currentOrg) throw new Error("No organization selected");

      if (editingItem) {
        const { error } = await supabase
          .from("faq_kb")
          .update({ ...data, updated_at: new Date().toISOString() })
          .eq("id", editingItem.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("faq_kb")
          .insert({ ...data, org_id: currentOrg.id });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faq-kb"] });
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: editingItem ? "FAQ updated" : "FAQ created",
        description: "The knowledge base has been updated.",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("faq_kb").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faq-kb"] });
      toast({
        title: "FAQ deleted",
        description: "The item has been removed from the knowledge base.",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      category: "",
      question: "",
      answer: "",
      active: true,
    });
    setEditingItem(null);
  };

  const openEditDialog = (item: FaqItem) => {
    setEditingItem(item);
    setFormData({
      category: item.category || "",
      question: item.question,
      answer: item.answer,
      active: item.active,
    });
    setIsDialogOpen(true);
  };

  const isAdmin = userRole === "admin";

  // Group by category
  const groupedFaqs = faqs?.reduce((acc, faq) => {
    const cat = faq.category || "General";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(faq);
    return acc;
  }, {} as Record<string, FaqItem[]>);

  // Filter by search
  const filteredGroups = groupedFaqs
    ? Object.entries(groupedFaqs).reduce((acc, [category, items]) => {
        const filtered = items.filter(
          (item) =>
            item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.answer.toLowerCase().includes(searchQuery.toLowerCase())
        );
        if (filtered.length > 0) acc[category] = filtered;
        return acc;
      }, {} as Record<string, FaqItem[]>)
    : {};

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Knowledge Base</h1>
          <p className="mt-1 text-muted-foreground">
            FAQs and information the AI uses to answer customer questions
          </p>
        </div>

        {isAdmin && (
          <Dialog
            open={isDialogOpen}
            onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) resetForm();
            }}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add FAQ
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingItem ? "Edit FAQ" : "Add FAQ"}</DialogTitle>
                <DialogDescription>
                  Add a question and answer that the AI can use to help customers.
                </DialogDescription>
              </DialogHeader>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  saveMutation.mutate(formData);
                }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    placeholder="e.g., Pricing, Services, Scheduling"
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="question">Question</Label>
                  <Input
                    id="question"
                    placeholder="What question might customers ask?"
                    value={formData.question}
                    onChange={(e) =>
                      setFormData({ ...formData, question: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="answer">Answer</Label>
                  <Textarea
                    id="answer"
                    placeholder="Provide a clear, helpful answer..."
                    value={formData.answer}
                    onChange={(e) =>
                      setFormData({ ...formData, answer: e.target.value })
                    }
                    required
                    rows={6}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    id="active"
                    checked={formData.active}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, active: checked })
                    }
                  />
                  <Label htmlFor="active">Active</Label>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={saveMutation.isPending}>
                    {saveMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {editingItem ? "Update" : "Create"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search FAQs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* FAQ List */}
      <div className="stat-card">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : Object.keys(filteredGroups).length > 0 ? (
          <div className="space-y-6">
            {Object.entries(filteredGroups).map(([category, items]) => (
              <div key={category}>
                <h3 className="mb-3 text-sm font-medium uppercase tracking-wider text-muted-foreground">
                  {category}
                </h3>
                <Accordion type="multiple" className="space-y-2">
                  {items.map((item) => (
                    <AccordionItem
                      key={item.id}
                      value={item.id}
                      className="rounded-lg border border-border bg-muted/30 px-4"
                    >
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center gap-3 text-left">
                          {!item.active && (
                            <span className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                              Inactive
                            </span>
                          )}
                          <span>{item.question}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="pt-2">
                          <p className="whitespace-pre-wrap text-muted-foreground">
                            {item.answer}
                          </p>
                          {isAdmin && (
                            <div className="mt-4 flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openEditDialog(item)}
                              >
                                <Pencil className="mr-2 h-3 w-3" />
                                Edit
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => deleteMutation.mutate(item.id)}
                              >
                                <Trash2 className="mr-2 h-3 w-3 text-destructive" />
                                Delete
                              </Button>
                            </div>
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">
              {searchQuery
                ? "No FAQs match your search."
                : "No FAQs in the knowledge base yet."}
            </p>
            {isAdmin && !searchQuery && (
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setIsDialogOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add your first FAQ
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
