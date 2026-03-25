# GPU Nodes

Configure remote GPU compute for inference, fine-tuning, and model hosting.

## Supported Providers

### RunPod
1. Create an account at https://runpod.io
2. Deploy a GPU pod (e.g. A100, RTX 4090)
3. Set `GPU_PROVIDER=runpod` and `GPU_API_KEY` in .env.local
4. Use the API endpoint in your Bifrost or Flowise configs

### Vast.ai
1. Create an account at https://vast.ai
2. Rent a GPU instance
3. Set `GPU_PROVIDER=vast` and `GPU_API_KEY` in .env.local

### Self-Hosted
1. Install NVIDIA drivers + CUDA on your GPU server
2. Run your model server (vLLM, Ollama, TGI)
3. Set `GPU_ENDPOINT=http://your-gpu-server:8000` in .env.local
4. Point Bifrost to use this endpoint

## Environment Variables
```env
# GPU_PROVIDER=runpod|vast|self-hosted
# GPU_API_KEY=
# GPU_ENDPOINT=http://localhost:8000
```

## Integration with Bifrost
Add your GPU endpoint as a custom provider in Bifrost's UI at :8081.
This lets you route specific models to your own GPU while using cloud
providers as fallback.
