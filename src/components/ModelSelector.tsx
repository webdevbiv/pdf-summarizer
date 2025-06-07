import { useState, useEffect } from 'react';

interface Model {
  id: string;
  name: string;
  description: string;
}

interface ModelCategory {
  category: string;
  models: Model[];
}

const DEFAULT_MODEL = "deepseek/deepseek-r1:free";

const modelCategories: ModelCategory[] = [
  {
    category: "DeepSeek",
    models: [
      {
        id: "deepseek/deepseek-r1:free",
        name: "DeepSeek R1",
        description: "671B parameters (37B active), open-source model with performance comparable to OpenAI's o1."
      },
      {
        id: "deepseek/deepseek-r1-distill-llama-70b:free",
        name: "DeepSeek R1 Distill Llama",
        description: "Distilled version of DeepSeek R1, optimized for efficiency."
      },
      {
        id: "deepseek/deepseek-r1-distill-qwen-14b:free",
        name: "DeepSeek R1 Distill Qwen 14B",
        description: "Distilled Qwen model with 14B parameters, suitable for various NLP tasks."
      },
      {
        id: "deepseek/deepseek-r1-distill-qwen-32b:free",
        name: "DeepSeek R1 Distill Qwen 32B",
        description: "Distilled Qwen model with 32B parameters, offering enhanced performance."
      },
      {
        id: "deepseek/deepseek-v3:free",
        name: "DeepSeek V3",
        description: "Latest DeepSeek model with improved capabilities and context handling."
      },
      {
        id: "deepseek/deepseek-v3-0324:free",
        name: "DeepSeek V3 0324",
        description: "Version 0324 of DeepSeek V3, featuring updated training data and optimizations."
      },
      {
        id: "deepseek/deepseek-v3-base:free",
        name: "DeepSeek V3 Base",
        description: "Base version of DeepSeek V3, providing a foundation for various applications."
      }
    ]
  },
  {
    category: "Meta Llama",
    models: [
      {
        id: "meta-llama/llama-4-maverick:free",
        name: "Llama 4 Maverick",
        description: "400B parameters (17B active), supports text and image inputs, optimized for multimodal tasks."
      },
      {
        id: "meta-llama/llama-4-scout:free",
        name: "Llama 4 Scout",
        description: "109B parameters (17B active), deployment-optimized variant of Llama 4 with efficient routing."
      }
    ]
  },
  {
    category: "Mistral",
    models: [
      {
        id: "mistralai/mistral-7b-instruct:free",
        name: "Mistral 7B Instruct",
        description: "7B parameter instruction-tuned model, suitable for general-purpose tasks."
      },
      {
        id: "mistralai/devstral-small:free",
        name: "Devstral Small",
        description: "Smaller variant of Mistral models, optimized for lightweight applications."
      }
    ]
  },
  {
    category: "Google",
    models: [
      {
        id: "google/gemma-3n-e4b-it:free",
        name: "Gemma 3N E4B",
        description: "Instruction-tuned Gemma model from Google, designed for interactive tasks."
      }
    ]
  },
  {
    category: "Microsoft",
    models: [
      {
        id: "microsoft/phi-4-reasoning:free",
        name: "Phi-4 Reasoning",
        description: "Microsoft's Phi-4 model focused on reasoning and logical tasks."
      },
      {
        id: "microsoft/phi-4-reasoning-plus:free",
        name: "Phi-4 Reasoning Plus",
        description: "Enhanced version of Phi-4 with improved reasoning capabilities."
      }
    ]
  },
  {
    category: "OpenGVLab",
    models: [
      {
        id: "opengvlab/internvl3-14b:free",
        name: "InternVL3 14B",
        description: "14B parameter model from OpenGVLab, suitable for various NLP applications."
      },
      {
        id: "opengvlab/internvl3-2b:free",
        name: "InternVL3 2B",
        description: "2B parameter lightweight model from OpenGVLab, optimized for efficiency."
      }
    ]
  },
  {
    category: "Qwen",
    models: [
      {
        id: "qwen/qwen3-14b:free",
        name: "Qwen3 14B",
        description: "14B parameter Qwen model, designed for diverse language tasks."
      },
      {
        id: "qwen/qwen3-235b-a22b:free",
        name: "Qwen3 235B",
        description: "235B parameter Qwen model with advanced capabilities."
      },
      {
        id: "qwen/qwen3-30b-a3b:free",
        name: "Qwen3 30B",
        description: "30B parameter Qwen model, balanced for performance and efficiency."
      },
      {
        id: "qwen/qwen3-32b:free",
        name: "Qwen3 32B",
        description: "32B parameter Qwen model, offering robust language understanding."
      },
      {
        id: "qwen/qwen3-8b:free",
        name: "Qwen3 8B",
        description: "8B parameter Qwen model, suitable for lightweight applications."
      }
    ]
  },
  {
    category: "THUDM",
    models: [
      {
        id: "thudm/glm-4-32b:free",
        name: "GLM-4 32B",
        description: "32B parameter GLM model from THUDM, designed for general-purpose tasks."
      },
      {
        id: "thudm/glm-z1-32b:free",
        name: "GLM-Z1 32B",
        description: "Variant of GLM-4 with specific optimizations for certain applications."
      }
    ]
  },
  {
    category: "Other",
    models: [
      {
        id: "nousresearch/deephermes-3-mistral-24b-preview:free",
        name: "DeepHermes 3 Mistral 24B",
        description: "24B parameter model from Nous Research, designed for advanced reasoning tasks."
      },
      {
        id: "tngtech/deepseek-r1t-chimera:free",
        name: "DeepSeek R1T Chimera",
        description: "Chimera variant of DeepSeek R1T, combining features from multiple models."
      }
    ]
  }
];

interface ModelSelectorProps {
  selectedModel: string;
  onModelChange: (model: string) => void;
}

export default function ModelSelector({ selectedModel = DEFAULT_MODEL, onModelChange }: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!selectedModel) {
      onModelChange(DEFAULT_MODEL);
    }
  }, [selectedModel, onModelChange]);

  const selectedModelInfo = modelCategories.flatMap(category => category.models).find(model => model.id === selectedModel);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2 text-left bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <div className="flex justify-between items-center">
          <div>
            <div className="font-medium text-gray-900 dark:text-white">
              {selectedModelInfo?.name || 'Select Model'}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {selectedModelInfo?.description || 'Choose a model for summarization'}
            </div>
          </div>
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'transform rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-96 overflow-y-auto">
          <div className="py-1">
            {modelCategories.flatMap(category => category.models).map((model) => (
              <button
                key={model.id}
                onClick={() => {
                  onModelChange(model.id);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 ${
                  selectedModel === model.id ? 'bg-blue-50 dark:bg-blue-900' : ''
                }`}
              >
                <div className="font-medium text-gray-900 dark:text-white">{model.name}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{model.description}</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 