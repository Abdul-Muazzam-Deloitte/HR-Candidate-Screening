from app.models.graph_state import CVProcessingState
from app.agent_tools.project_contribution_tool import get_project_summary
from ag_ui.core import (
    RunStartedEvent,
    RunFinishedEvent,
    RunErrorEvent,
    StepStartedEvent,
    StepFinishedEvent,
    TextMessageContentEvent,
    EventType
)

from langgraph.config import get_stream_writer

def project_contribution_node(state: CVProcessingState):

    writer = get_stream_writer()
    writer(RunStartedEvent(type=EventType.RUN_STARTED, thread_id="Project Contribution Screening Process", run_id="project_contribution"))

    try:
        if state.get("error") or not state.get("cv_data").github_url:
        
            # return state
            writer(RunFinishedEvent(type=EventType.RUN_FINISHED, thread_id="Project Contribution Screening Process", run_id="project_contribution", result = { "note" : "No Github URL available for screening"}))
            return state["messages"].append({"type": "warning", "content": "No Github URL available for screening"})

        project_contributions_dict = get_project_summary.invoke({
            "project_url" : state["cv_data"].github_url
            # "project_url" : "https://github.com/Abdul-Muazzam-Deloitte"
        })

        if not project_contributions_dict:
            writer(RunFinishedEvent(type=EventType.RUN_FINISHED, thread_id="Project Contribution Screening Process", run_id="project_contribution", result = { "note" : "No project information available"}))
            return {"project_info": None}
        
        # Check if the result contains an error
        if "error" in project_contributions_dict:
            writer( RunErrorEvent(type=EventType.RUN_ERROR, message=f"project_contribution - {project_contributions_dict["error"]}") ) 
            return {"error": f"{project_contributions_dict["error"]}"}
        
        # Validate with Pydantic
        state["messages"].append({"type": "success", "content": "Projects screening completed"})
        
        writer(RunFinishedEvent(type=EventType.RUN_FINISHED, thread_id="Project Contribution Screening Process", run_id="project_contribution", result=project_contributions_dict))
        return {"project_info": project_contributions_dict}
        
    except Exception as e:
        writer(RunErrorEvent(type=EventType.RUN_ERROR, message=f"project_contribution - {str(e)}"))
        return {"error": f"Projects screening node failed: {str(e)}"}