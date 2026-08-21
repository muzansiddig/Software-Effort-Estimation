import gradio as gr
import spaces
import torch


device = torch.device("cuda" if torch.cuda.is_available() else "cpu")


@spaces.GPU
def greet(n):
    zero = torch.tensor([0.0], device=device)
    value = torch.tensor([float(n)], device=device)
    result = zero + value
    print(f"Tensor device inside function: {result.device}")
    return f"Hello {result.item()} Tensor"


demo = gr.Interface(
    fn=greet,
    inputs=gr.Number(label="Enter a number"),
    outputs=gr.Text(label="Output"),
    title="GPU Test Space",
    description="This demo confirms Tensor is running on CUDA when available.",
)


if __name__ == "__main__":
    demo.launch()
