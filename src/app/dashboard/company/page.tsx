"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/lib/supabase";
import { Company } from "@/lib/database";

const companySchema = z.object({
  name: z.string().min(1, "업체명을 입력해주세요"),
  email: z.string().email("올바른 이메일 주소를 입력해주세요"),
  description: z.string().optional(),
  processSteps: z.string().min(1, "제작 과정을 입력해주세요"),
});

type CompanyFormData = z.infer<typeof companySchema>;

export default function CompanyPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [existingCompany, setExistingCompany] = useState<Company | null>(null);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const form = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: "",
      email: "",
      description: "",
      processSteps: "",
    },
  });

  useEffect(() => {
    if (user) {
      loadCompanyInfo();
    }
  }, [user]);

  const loadCompanyInfo = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .schema("custom")
        .from("companies")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (data && !error) {
        setExistingCompany(data);
        form.reset({
          name: data.name,
          email: data.email,
          description: data.description || "",
          processSteps: Array.isArray(data.process_steps)
            ? data.process_steps.join("\n")
            : "",
        });
      }
    } catch (error) {
      console.error("Error loading company info:", error);
    }
  };

  const onSubmit = async (data: CompanyFormData) => {
    if (!user) return;

    setLoading(true);
    setMessage(null);

    try {
      const processStepsArray = data.processSteps
        .split("\n")
        .map((step) => step.trim())
        .filter((step) => step.length > 0);

      const companyData = {
        user_id: user.id,
        name: data.name,
        email: data.email,
        description: data.description || null,
        process_steps: processStepsArray,
      };

      console.log("companyData", companyData);

      let result;

      if (existingCompany) {
        // 업데이트
        result = await supabase
          .schema("custom")
          .from("companies")
          .update(companyData)
          .eq("id", existingCompany.id)
          .select()
          .single();
      } else {
        // 생성
        result = await supabase
          .schema("custom")
          .from("companies")
          .insert([companyData])
          .select()
          .single();
      }

      if (result.error) {
        setMessage({ type: "error", text: result.error.message });
      } else {
        setMessage({
          type: "success",
          text: existingCompany
            ? "업체 정보가 업데이트되었습니다"
            : "업체 정보가 등록되었습니다",
        });
        setExistingCompany(result.data);
      }
    } catch (error) {
      setMessage({ type: "error", text: "오류가 발생했습니다" });
      console.error("Error saving company:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className='space-y-6'>
        <div>
          <h2 className='text-2xl font-bold text-gray-900'>업체 정보</h2>
          <p className='mt-1 text-sm text-gray-600'>
            업체 정보와 제작 과정을 설정하세요
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {existingCompany ? "업체 정보 수정" : "업체 정보 등록"}
            </CardTitle>
            <CardDescription>
              고객에게 보여질 업체 정보와 제작 과정을 설정합니다
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className='space-y-6'
              >
                <FormField
                  control={form.control}
                  name='name'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>업체명 *</FormLabel>
                      <FormControl>
                        <Input placeholder='예: 커스텀 제작소' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='email'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>업체 이메일 *</FormLabel>
                      <FormControl>
                        <Input
                          type='email'
                          placeholder='contact@company.com'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='description'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>업체 소개</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder='업체에 대한 간단한 소개를 입력하세요'
                          className='min-h-[100px]'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='processSteps'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>제작 과정 *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={`제작 과정을 한 줄씩 입력하세요. 예:\n주문 접수\n디자인 검토\n샘플 제작\n최종 제작\n품질 검수\n배송`}
                          className='min-h-[150px]'
                          {...field}
                        />
                      </FormControl>
                      <p className='text-sm text-gray-600'>
                        각 단계를 새 줄에 입력하세요. 이 단계들은 주문 진행
                        상황을 추적하는 데 사용됩니다.
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {message && (
                  <div
                    className={`p-4 rounded-md ${
                      message.type === "success"
                        ? "bg-green-50 text-green-700 border border-green-200"
                        : "bg-red-50 text-red-700 border border-red-200"
                    }`}
                  >
                    {message.text}
                  </div>
                )}

                <Button type='submit' disabled={loading} className='w-full'>
                  {loading
                    ? "저장 중..."
                    : existingCompany
                    ? "업체 정보 업데이트"
                    : "업체 정보 등록"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {existingCompany && (
          <Card>
            <CardHeader>
              <CardTitle>현재 설정된 제작 과정</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-2'>
                {Array.isArray(existingCompany.process_steps) &&
                  existingCompany.process_steps.map((step, index) => (
                    <div key={index} className='flex items-center space-x-2'>
                      <div className='flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm'>
                        {index + 1}
                      </div>
                      <span>{step}</span>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
