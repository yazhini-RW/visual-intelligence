from langchain_groq import ChatGroq
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser
from dotenv import load_dotenv
import base64
import os

load_dotenv()

def describe_scene(image_path: str, detections: list, ocr_text: str) -> str:
    try:
        llm = ChatGroq(
            temperature=0,
            model_name="llama-3.3-70b-versatile",
            groq_api_key=os.getenv("GROQ_API_KEY")
        )

        objects = [d["label"] for d in detections if "label" in d]
        objects_str = ", ".join(objects) if objects else "no objects detected"

        prompt = PromptTemplate(
            input_variables=["objects", "text", "filename"],
            template="""
            You are a visual intelligence analyst. Analyze this image based on the following data:
            
            Objects detected: {objects}
            Text found in image: {text}
            Image filename: {filename}
            
            Provide a clear, professional 2-3 sentence description of:
            1. What is happening in the scene
            2. Key objects and their context
            3. Any notable observations
            
            Keep it concise and factual.
            """
        )

        chain = prompt | llm | StrOutputParser()
        description = chain.invoke({
            "objects": objects_str,
            "text": ocr_text if ocr_text else "none",
            "filename": os.path.basename(image_path)
        })

        return description

    except Exception as e:
        return f"Scene description unavailable: {str(e)}"