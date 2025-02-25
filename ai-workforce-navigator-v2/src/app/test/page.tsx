echo 'import { createClient } from "@/lib/supabase/server";

async function createCompany() {
  "use server"
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from("companies")
    .insert({
      name: "Test Company",
      website_url: "https://testcompany.com",
      industry: "Technology",
      size: 500,
      location: "New York",
      employee_count: 500
    })
    .select();
    
  if (error) {
    console.error("Error creating company:", error);
    return { error: error.message };
  }
  
  return data;
}

export default async function TestPage() {
  const result = await createCompany();
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">API Test Results</h1>
      <pre className="bg-gray-100 p-4 rounded-lg overflow-auto max-w-full">
        {JSON.stringify(result, null, 2)}
      </pre>
    </div>
  );
}' > src/app/test/page.tsx