"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { FileText } from "lucide-react";

export default function DocumentsPage() {
  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold dark:text-white">Documents</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Access and manage your documents
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Document Library</CardTitle>
            <CardDescription>
              Your uploaded documents and files
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <FileText className="w-12 h-12 mb-4" />
              <p>Document library interface coming soon...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
