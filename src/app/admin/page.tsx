"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AdminPage() {
  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const checkTables = async () => {
    setLoading(true);
    try {
      const tables = ["companies", "orders", "order_progress"];
      const results = [];

      for (const table of tables) {
        try {
          const { data, error } = await supabase
            .schema("custom")
            .from(table)
            .select("*")
            .limit(1);

          if (error) {
            results.push(`❌ ${table}: ${error.message}`);
          } else {
            results.push(`✅ ${table}: 테이블 존재함`);
          }
        } catch (err) {
          results.push(`❌ ${table}: 테이블 없음 또는 접근 불가`);
        }
      }

      setResult(results.join("\n"));
    } catch (error) {
      setResult(`❌ Exception checking tables: ${String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  const testInsert = async () => {
    setLoading(true);
    try {
      // 간단한 INSERT 테스트
      const { data, error } = await supabase
        .schema("custom")
        .from("companies")
        .insert({
          user_id: "00000000-0000-0000-0000-000000000000", // 임시 UUID
          name: "테스트 업체",
          email: "test@example.com",
          description: "테스트용 업체입니다",
          process_steps: ["디자인", "제작", "검수", "배송"],
        })
        .select();

      if (error) {
        setResult(`❌ Insert Error: ${error.message}`);
      } else {
        setResult(`✅ Insert Success: ${JSON.stringify(data, null, 2)}`);
      }
    } catch (error) {
      setResult(`❌ Insert Exception: ${String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='container mx-auto p-8 max-w-4xl'>
      <h1 className='text-3xl font-bold mb-8'>데이터베이스 관리자 페이지</h1>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-8'>
        <button
          onClick={checkTables}
          disabled={loading}
          className='bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50'
        >
          테이블 확인
        </button>

        <button
          onClick={testInsert}
          disabled={loading}
          className='bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50'
        >
          데이터 삽입 테스트
        </button>

        <button
          onClick={() => setResult("")}
          className='bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded'
        >
          결과 지우기
        </button>
      </div>

      {loading && (
        <div className='mb-4 p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded'>
          실행 중...
        </div>
      )}

      {result && (
        <div className='mb-4 p-4 bg-gray-100 border rounded'>
          <h3 className='font-semibold mb-2'>실행 결과:</h3>
          <pre className='whitespace-pre-wrap text-sm overflow-x-auto'>
            {result}
          </pre>
        </div>
      )}

      <div className='mt-8 p-4 bg-blue-50 rounded-lg'>
        <h2 className='text-lg font-semibold mb-2'>사용 방법</h2>
        <ol className='list-decimal list-inside space-y-1 text-sm'>
          <li>
            먼저 Supabase 대시보드에서 database-schema.sql 파일의 내용을
            실행하여 테이블을 생성합니다
          </li>
          <li>
            테이블 확인 버튼으로 테이블이 정상적으로 생성되었는지 확인합니다
          </li>
          <li>
            데이터 삽입 테스트 버튼으로 데이터 삽입이 정상 작동하는지
            테스트합니다
          </li>
        </ol>
      </div>
    </div>
  );
}
