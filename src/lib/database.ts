import { supabase } from "./supabase";

// 데이터베이스 테이블 타입 정의
export interface Company {
  id: string;
  user_id: string;
  name: string;
  email: string;
  description?: string;
  process_steps: string[];
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  company_id: string;
  order_number: string;
  customer_name: string;
  customer_email?: string;
  customer_phone?: string;
  product_description?: string;
  status: "pending" | "in_progress" | "completed" | "cancelled";
  total_amount?: number;
  created_at: string;
  updated_at: string;
}

export interface OrderProgress {
  id: string;
  order_id: string;
  step_name: string;
  step_order: number;
  status: "pending" | "in_progress" | "completed";
  notes?: string;
  started_at?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

// 데이터베이스 연결 테스트 함수
export async function testDatabaseConnection() {
  try {
    const { data, error } = await supabase
      .schema("custom")
      .from("companies")
      .select("count(*)")
      .limit(1);

    if (error) {
      console.error("Database connection error:", error);
      return { success: false, error: error.message };
    }

    return { success: true, message: "Database connected successfully" };
  } catch (error) {
    console.error("Database connection failed:", error);
    return { success: false, error: "Connection failed" };
  }
}

// 회사 생성
export async function createCompany(
  companyData: Omit<Company, "id" | "created_at" | "updated_at">
) {
  const { data, error } = await supabase
    .schema("custom")
    .from("companies")
    .insert([companyData])
    .select()
    .single();

  if (error) {
    console.error("Error creating company:", error);
    return { success: false, error: error.message };
  }

  return { success: true, data };
}

// 주문 생성
export async function createOrder(
  orderData: Omit<Order, "id" | "created_at" | "updated_at">
) {
  const { data, error } = await supabase
    .schema("custom")
    .from("orders")
    .insert([orderData])
    .select()
    .single();

  if (error) {
    console.error("Error creating order:", error);
    return { success: false, error: error.message };
  }

  return { success: true, data };
}

// 주문번호로 주문 조회
export async function getOrderByNumber(orderNumber: string) {
  const { data, error } = await supabase
    .schema("custom")
    .from("orders")
    .select(
      `
      *,
      companies (name, email),
      order_progress (*)
    `
    )
    .eq("order_number", orderNumber)
    .single();

  if (error) {
    console.error("Error fetching order:", error);
    return { success: false, error: error.message };
  }

  return { success: true, data };
}

// 주문 진행 상황 업데이트
export async function updateOrderProgress(
  progressId: string,
  updates: Partial<
    Pick<OrderProgress, "status" | "notes" | "started_at" | "completed_at">
  >
) {
  const { data, error } = await supabase
    .schema("custom")
    .from("order_progress")
    .update(updates)
    .eq("id", progressId)
    .select()
    .single();

  if (error) {
    console.error("Error updating order progress:", error);
    return { success: false, error: error.message };
  }

  return { success: true, data };
}
