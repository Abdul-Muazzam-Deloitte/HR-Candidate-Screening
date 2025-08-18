async def hr_screening_workflow(pdf_path: str, session: WebSocket):
    try:
        for chunk in workflow_graph.stream(
                initial_state,
                stream_mode="updates"
        ):
            # Convert Pydantic model or dict to JSON string
            if hasattr(chunk, "model_dump"):  # Pydantic model
                chunk_dict = chunk.model_dump()
            else:
                chunk_dict = dict(chunk)
            
            # Send as WebSocket JSON message
            await session.send_json(chunk_dict)

        # Send final state as WebSocket message
        await session.send_json(initial_state)

        print("✅ Workflow execution completed successfully")
        
    except Exception as e:
        error_data = {
            "error": True,
            "message": str(e),
            "timestamp": "2025-01-15T10:32:00Z"
        }
        await session.send_json(error_data)