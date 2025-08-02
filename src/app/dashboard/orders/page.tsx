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
import { Order, Company, OrderProgress } from "@/lib/database";

const orderSchema = z.object({
  orderNumber: z.string().min(1, "주문번호를 입력해주세요"),
  customerName: z.string().min(1, "고객명을 입력해주세요"),
  customerEmail: z
    .string()
    .email("올바른 이메일 주소를 입력해주세요")
    .optional()
    .or(z.literal("")),
  customerPhone: z.string().optional(),
  productDescription: z.string().min(1, "제품 설명을 입력해주세요"),
  totalAmount: z.string().optional(),
});

type OrderFormData = z.infer<typeof orderSchema>;

interface OrderWithProgress extends Order {
  order_progress: OrderProgress[];
}

export default function OrdersPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [company, setCompany] = useState<Company | null>(null);
  const [orders, setOrders] = useState<OrderWithProgress[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const form = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      orderNumber: "",
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      productDescription: "",
      totalAmount: "",
    },
  });

  useEffect(() => {
    if (user) {
      loadCompanyAndOrders();
    }
  }, [user]);

  const loadCompanyAndOrders = async () => {
    if (!user) return;

    try {
      // 회사 정보 로드
      const { data: companyData } = await supabase
        .schema("custom")
        .from("companies")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (companyData) {
        setCompany(companyData);

        // 주문 목록 로드
        const { data: ordersData } = await supabase
          .schema("custom")
          .from("orders")
          .select(
            `
            *,
            order_progress (*)
          `
          )
          .eq("company_id", companyData.id)
          .order("created_at", { ascending: false });

        if (ordersData) {
          setOrders(ordersData as OrderWithProgress[]);
        }
      }
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const onSubmit = async (data: OrderFormData) => {
    if (!user || !company) return;

    setLoading(true);
    setMessage(null);

    try {
      // 주문 생성
      const orderData = {
        company_id: company.id,
        order_number: data.orderNumber,
        customer_name: data.customerName,
        customer_email: data.customerEmail || null,
        customer_phone: data.customerPhone || null,
        product_description: data.productDescription,
        total_amount: data.totalAmount ? parseFloat(data.totalAmount) : null,
        status: "pending" as const,
      };

      const { data: newOrder, error: orderError } = await supabase
        .schema("custom")
        .from("orders")
        .insert([orderData])
        .select()
        .single();

      if (orderError) {
        setMessage({ type: "error", text: orderError.message });
        return;
      }

      // 제작 과정 단계별 진행 상황 레코드 생성
      if (company.process_steps && Array.isArray(company.process_steps)) {
        const progressData = company.process_steps.map((step, index) => ({
          order_id: newOrder.id,
          step_name: step,
          step_order: index + 1,
          status: "pending" as const,
        }));

        const { error: progressError } = await supabase
          .schema("custom")
          .from("order_progress")
          .insert(progressData);

        if (progressError) {
          console.error("Error creating progress records:", progressError);
        }
      }

      setMessage({ type: "success", text: "주문이 등록되었습니다" });
      form.reset();
      setShowForm(false);
      loadCompanyAndOrders();
    } catch (error) {
      setMessage({ type: "error", text: "오류가 발생했습니다" });
      console.error("Error creating order:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateProgressStatus = async (
    progressId: string,
    newStatus: "pending" | "in_progress" | "completed"
  ) => {
    try {
      const updates: Partial<OrderProgress> = { status: newStatus };

      if (newStatus === "in_progress") {
        updates.started_at = new Date().toISOString();
      } else if (newStatus === "completed") {
        updates.completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .schema("custom")
        .from("order_progress")
        .update(updates)
        .eq("id", progressId);

      if (error) {
        console.error("Error updating progress:", error);
        setMessage({
          type: "error",
          text: "진행 상황 업데이트에 실패했습니다",
        });
      } else {
        setMessage({ type: "success", text: "진행 상황이 업데이트되었습니다" });
        loadCompanyAndOrders();
      }
    } catch (error) {
      console.error("Error updating progress:", error);
      setMessage({ type: "error", text: "오류가 발생했습니다" });
    }
  };

  if (!company) {
    return (
      <DashboardLayout>
        <div className='text-center py-12'>
          <h3 className='text-lg font-medium text-gray-900 mb-2'>
            업체 정보를 먼저 등록해주세요
          </h3>
          <p className='text-gray-600 mb-4'>
            주문을 관리하려면 업체 정보와 제작 과정을 설정해야 합니다
          </p>
          <Button onClick={() => (window.location.href = "/dashboard/company")}>
            업체 정보 등록하기
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className='space-y-6'>
        <div className='flex justify-between items-center'>
          <div>
            <h2 className='text-2xl font-bold text-gray-900'>주문 관리</h2>
            <p className='mt-1 text-sm text-gray-600'>
              주문을 등록하고 진행 상황을 관리하세요
            </p>
          </div>
          <Button onClick={() => setShowForm(!showForm)}>
            {showForm ? "취소" : "새 주문 등록"}
          </Button>
        </div>

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

        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle>새 주문 등록</CardTitle>
              <CardDescription>고객 주문 정보를 입력하세요</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className='space-y-4'
                >
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <FormField
                      control={form.control}
                      name='orderNumber'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>주문번호 *</FormLabel>
                          <FormControl>
                            <Input placeholder='예: ORD-2024-001' {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name='customerName'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>고객명 *</FormLabel>
                          <FormControl>
                            <Input placeholder='홍길동' {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name='customerEmail'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>고객 이메일</FormLabel>
                          <FormControl>
                            <Input
                              type='email'
                              placeholder='customer@email.com'
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name='customerPhone'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>고객 전화번호</FormLabel>
                          <FormControl>
                            <Input placeholder='010-1234-5678' {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name='productDescription'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>제품 설명 *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder='주문할 제품에 대한 상세 설명을 입력하세요'
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
                    name='totalAmount'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>주문 금액</FormLabel>
                        <FormControl>
                          <Input
                            type='number'
                            placeholder='100000'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type='submit' disabled={loading} className='w-full'>
                    {loading ? "등록 중..." : "주문 등록"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}

        {/* 주문 목록 */}
        <div className='space-y-4'>
          {orders.length === 0 ? (
            <Card>
              <CardContent className='text-center py-12'>
                <p className='text-gray-600'>등록된 주문이 없습니다</p>
                <Button
                  onClick={() => setShowForm(true)}
                  className='mt-4'
                  variant='outline'
                >
                  첫 주문 등록하기
                </Button>
              </CardContent>
            </Card>
          ) : (
            orders.map((order) => (
              <Card key={order.id}>
                <CardHeader>
                  <div className='flex justify-between items-start'>
                    <div>
                      <CardTitle className='text-lg'>
                        주문번호: {order.order_number}
                      </CardTitle>
                      <CardDescription>
                        고객: {order.customer_name} | 등록일:{" "}
                        {new Date(order.created_at).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <div
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        order.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : order.status === "in_progress"
                          ? "bg-blue-100 text-blue-800"
                          : order.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {order.status === "pending"
                        ? "대기"
                        : order.status === "in_progress"
                        ? "진행중"
                        : order.status === "completed"
                        ? "완료"
                        : "취소"}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className='space-y-4'>
                    <div>
                      <h4 className='font-medium mb-1'>제품 설명</h4>
                      <p className='text-sm text-gray-600'>
                        {order.product_description}
                      </p>
                    </div>

                    <div>
                      <h4 className='font-medium mb-2'>제작 진행 상황</h4>
                      <div className='space-y-2'>
                        {order.order_progress
                          .sort((a, b) => a.step_order - b.step_order)
                          .map((progress) => (
                            <div
                              key={progress.id}
                              className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'
                            >
                              <div className='flex items-center space-x-3'>
                                <div
                                  className={`w-3 h-3 rounded-full ${
                                    progress.status === "completed"
                                      ? "bg-green-500"
                                      : progress.status === "in_progress"
                                      ? "bg-blue-500"
                                      : "bg-gray-300"
                                  }`}
                                />
                                <span className='font-medium'>
                                  {progress.step_name}
                                </span>
                                {progress.completed_at && (
                                  <span className='text-xs text-gray-500'>
                                    완료:{" "}
                                    {new Date(
                                      progress.completed_at
                                    ).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                              <div className='flex space-x-2'>
                                {progress.status === "pending" && (
                                  <Button
                                    size='sm'
                                    variant='outline'
                                    onClick={() =>
                                      updateProgressStatus(
                                        progress.id,
                                        "in_progress"
                                      )
                                    }
                                  >
                                    시작
                                  </Button>
                                )}
                                {progress.status === "in_progress" && (
                                  <Button
                                    size='sm'
                                    onClick={() =>
                                      updateProgressStatus(
                                        progress.id,
                                        "completed"
                                      )
                                    }
                                  >
                                    완료
                                  </Button>
                                )}
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
