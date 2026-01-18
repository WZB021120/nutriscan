import { AnalysisResult } from "../types";

// 使用 OpenAI 兼容格式的 API
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8045/v1";
const API_KEY = import.meta.env.VITE_API_KEY || "";

console.log("API Config:", { API_BASE_URL, API_KEY: API_KEY ? "已设置" : "未设置" });

// 清理和解析 JSON
const parseJsonResponse = (content: string): AnalysisResult => {
  // 移除可能的 markdown 代码块标记
  let cleaned = content.trim();
  cleaned = cleaned.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();

  console.log("清理后的内容:", cleaned);

  // 直接解析
  const result = JSON.parse(cleaned);

  console.log("解析后的结果:", result);
  console.log("calories 值:", result.calories, "类型:", typeof result.calories);

  return result as AnalysisResult;
};

export const analyzeFoodImage = async (base64Image: string, retryCount = 0): Promise<AnalysisResult> => {
  console.log("开始分析图片, base64长度:", base64Image.length, "重试次数:", retryCount);

  try {
    const requestBody = {
      model: "qwen3-vl-plus",
      stream: false, // 确保非流式响应，避免截断
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`,
              },
            },
            {
              type: "text",
              text: `分析图片中的食物，返回单行JSON格式：{"name":"名称","calories":数字,"macros":{"protein":数字,"carbs":数字,"fat":数字},"insight":"建议emoji"}
只返回JSON，不要其他文字。`,
            },
          ],
        },
      ],
      temperature: 0.7,
      max_tokens: 1024,
    };

    console.log("发送请求到:", `${API_BASE_URL}/chat/completions`);

    const response = await fetch(`${API_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(requestBody),
    });

    console.log("响应状态:", response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error Response:", errorText);
      throw new Error(`API 请求失败 (${response.status}): ${errorText.slice(0, 200)}`);
    }

    const data = await response.json();
    console.log("API 响应数据:", data);

    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      console.error("响应内容为空:", data);
      throw new Error("API response was empty");
    }

    console.log("原始内容:", content);

    try {
      return parseJsonResponse(content);
    } catch (parseError) {
      console.error("JSON 解析失败:", parseError);

      // 如果还有重试机会，自动重试
      if (retryCount < 2) {
        console.log("自动重试...");
        return analyzeFoodImage(base64Image, retryCount + 1);
      }

      throw parseError;
    }

  } catch (error) {
    console.error("AI Analysis Error:", error);

    // 如果是 JSON 解析错误且还有重试机会，自动重试
    if (error instanceof SyntaxError && retryCount < 2) {
      console.log("JSON 语法错误，自动重试...");
      return analyzeFoodImage(base64Image, retryCount + 1);
    }

    // 抛出具体的错误信息
    if (error instanceof Error) {
      throw new Error(`分析失败: ${error.message}`);
    }
    throw new Error("AI 分析遇到了问题，请重新拍摄。");
  }
};
