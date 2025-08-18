from app.models.graph_state import CVProcessingState
from app.agent_tools.cv_scoring_tool import score_cv_against_jd

async def cv_scoring_node(state: CVProcessingState, session=None):
    """Node to score CV against job description.

    Args:
        state (CVProcessingState): The current state of the CV processing workflow.

    Returns:
        dict: Updated state with CV score or error message.
    """

    try:
        # Node started event
        if session:
            await session.send({
                "type": "node_status",
                "node": "cv_scoring",
                "status": "started"
            })

        if state.get("error") or (not state.get("cv_data") or not state.get("job_description")):
            error_msg = "No CV data available for scoring"
            state["error"] = error_msg
            if session:
                await session.send({
                    "type": "node_status",
                    "node": "cv_scoring",
                    "status": "error",
                    "error": error_msg
                })
            return state

        # Call the async scoring tool with streaming
        score_result_object = await score_cv_against_jd(
            cv_data=state["cv_data"]["markdown"],
            job_description=state["job_description"],
            session=session
        )

        # Append success message
        state["messages"].append({"type": "success", "content": "CV scored"})

        # Node finished event
        if session:
            await session.send({
                "type": "node_status",
                "node": "cv_scoring",
                "status": "finished",
                "result": score_result_object
            })

        return {"cv_score": score_result_object}

    except Exception as e:
        state["error"] = f"CV scoring failed: {str(e)}"
        if session:
            await session.send({
                "type": "node_status",
                "node": "cv_scoring",
                "status": "error",
                "error": str(e)
            })
        return state