from models.graph_state import CVProcessingState
from agent_tools.interview_questions_tool import generate_interview_questions, regenerate_interview_questions
from agent_tools.validate_questions_tool import validate_questions_semantically

MAX_RETRIES = 2

def interview_questions_node(state: CVProcessingState):
    """Node to generate interview questions based on CV data.

    Args:
        state (CVProcessingState): The current state of the CV processing workflow.

    Returns:
        dict: Updated state with generated interview questions or error message.
    """
    retries = 0

    try:
            if state.get("error") or (not state.get("cv_data") and not state.get("job_description")): 
                # return state
                return {"error": "No cv data available for interview questions."}
            
            interview_questions_object = generate_interview_questions.invoke({
                "candidate_cv_content": state["cv_data"].markdown,
                "job_description": state["job_description"]
            })

            if interview_questions_object:
                 
                while retries < MAX_RETRIES:
                    hallucinated = validate_questions_semantically.invoke({
                        "interview_questions" : interview_questions_object,
                        "candidate_cv_content" : state["cv_data"].markdown,
                        "job_description" : state["job_description"]
                    })
                                                                                
                    if not hallucinated:
                        print(interview_questions_object)
                        return {"interview_questions" : interview_questions_object}
                    
                    hallucinated_questions = [hq['question'] for hq in hallucinated]
                    interview_questions_object = regenerate_interview_questions.invoke({
                        "interview_questions": interview_questions_object,
                        "hallucinated_questions": hallucinated_questions,
                        "candidate_cv_content": state["cv_data"].markdown,
                        "job_description": state["job_description"]
                    })
            
                    retries += 1

            # Process the generated interview questions
            state["messages"].append({"type": "success", "content": f"Interview questions generated successfully"})
            return {"interview_questions" : interview_questions_object}
    except Exception as e:
        state["messages"].append({"type": "error", "content": f"Generation of interview questions node failed: {str(e)}"})
        # return state
        return {"error": f"Generation of interview questions node: {str(e)}"}