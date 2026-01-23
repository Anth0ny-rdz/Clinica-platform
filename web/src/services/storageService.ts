import { supabase } from "@/services/supabaseClient";


export async function uploadExamFile(file: File): Promise<string> {
  const fileExt = file.name.split(".").pop();
  const fileName = `${crypto.randomUUID()}.${fileExt}`;
  const filePath = `results/${fileName}`;

  const { error } = await supabase.storage
    .from("exam-results")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) throw error;

  return filePath; // ⚠️ SOLO PATH INTERNO
}