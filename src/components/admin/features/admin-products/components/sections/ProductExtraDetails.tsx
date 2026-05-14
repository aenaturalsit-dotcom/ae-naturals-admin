// src/components/admin/features/admin-products/components/sections/ProductExtraDetails.tsx

"use client";

import React, { useMemo, useRef } from "react";
import {
  useFormContext,
  useFieldArray,
  useWatch,
  Path,
} from "react-hook-form";

import {
  ShieldAlert,
  Plus,
  Trash2,
  X,
  List,
  Type,
  Bold,
  Eye,
  Sparkles,
} from "lucide-react";

import { ProductFormValues } from "../../schemas/product.schema";

type SmartEditorProps = {
  name: Path<ProductFormValues>;
  label: string;
  placeholder?: string;
};

const SmartEditor = ({
  name,
  label,
  placeholder,
}: SmartEditorProps) => {
  const {
    register,
    setValue,
    control,
  } = useFormContext<ProductFormValues>();

  const textareaRef = useRef<HTMLTextAreaElement | null>(
    null
  );

  // WATCH VALUE
  const value =
    (useWatch<ProductFormValues>({
      control,
      name,
    }) as string) || "";

  // LIVE HTML PREVIEW
  const previewHtml = useMemo(() => {
    if (!value) return "";

    const lines = value.split("\n");

    let html = "";
    let inList = false;

    lines.forEach((line) => {
      const trimmed = line.trim();

      // BULLET
      if (
        trimmed.startsWith("- ") ||
        trimmed.startsWith("* ")
      ) {
        if (!inList) {
          html += `<ul class="list-disc pl-5 space-y-1">`;
          inList = true;
        }

        let item = trimmed.substring(2);

        // BOLD
        item = item.replace(
          /\*\*(.*?)\*\*/g,
          "<strong>$1</strong>"
        );

        html += `<li>${item}</li>`;
      } else {
        if (inList) {
          html += "</ul>";
          inList = false;
        }

        if (trimmed !== "") {
          let paragraph = trimmed.replace(
            /\*\*(.*?)\*\*/g,
            "<strong>$1</strong>"
          );

          html += `<p class="mb-2">${paragraph}</p>`;
        }
      }
    });

    if (inList) {
      html += "</ul>";
    }

    return html;
  }, [value]);

  // INSERT TEXT
  const insertText = (
    before: string,
    after = ""
  ) => {
    const textarea = textareaRef.current;

    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    const currentValue = value;

    const selected = currentValue.slice(start, end);

    const newValue =
      currentValue.slice(0, start) +
      before +
      selected +
      after +
      currentValue.slice(end);

    setValue(name, newValue as any, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });

    requestAnimationFrame(() => {
      textarea.focus();

      const cursor =
        start + before.length + selected.length;

      textarea.setSelectionRange(cursor, cursor);
    });
  };

  // BULLETS
  const convertToBullets = () => {
    const textarea = textareaRef.current;

    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    // IF NOTHING SELECTED
    if (start === end) {
      const newValue =
        value.slice(0, start) +
        "- " +
        value.slice(end);

      setValue(name, newValue as any, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });

      requestAnimationFrame(() => {
        textarea.focus();

        const cursor = start + 2;

        textarea.setSelectionRange(cursor, cursor);
      });

      return;
    }

    // SELECTED TEXT
    const selectedText = value.slice(start, end);

    const bulletText = selectedText
      .split("\n")
      .map((line) => {
        if (!line.trim()) return line;

        return line.startsWith("- ")
          ? line
          : `- ${line}`;
      })
      .join("\n");

    const newValue =
      value.slice(0, start) +
      bulletText +
      value.slice(end);

    setValue(name, newValue as any, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });

    requestAnimationFrame(() => {
      textarea.focus();

      textarea.setSelectionRange(
        start,
        start + bulletText.length
      );
    });
  };

  // PARAGRAPH
  const makeParagraph = () => {
    const textarea = textareaRef.current;

    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    const selectedText = value.slice(start, end);

    if (!selectedText.trim()) return;

    const paragraphText = `\n${selectedText}\n`;

    const newValue =
      value.slice(0, start) +
      paragraphText +
      value.slice(end);

    setValue(name, newValue as any, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });

    requestAnimationFrame(() => {
      textarea.focus();
    });
  };

  // TEMPLATE
  const insertTemplate = () => {
    let template = "";

    if (name === "ingredients") {
      template = `- Aloe Vera
- Neem
- Turmeric
- Rosemary Oil`;
    }

    if (name === "extra.directions") {
      template = `- Apply gently on skin
- Massage for 2 minutes
- Use twice daily`;
    }

    if (name === "extra.safetyInfo") {
      template = `- For external use only
- Keep away from children
- Avoid direct eye contact`;
    }

    if (name === "extra.legalDisclaimer") {
      template = `- Results may vary
- Consult a professional before use`;
    }

    setValue(name, template as any, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  };

  // AUTO BULLET ENTER
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    const textarea = textareaRef.current;

    if (!textarea) return;

    if (e.key === "Enter") {
      const start = textarea.selectionStart;

      const lines = value.substring(0, start).split(
        "\n"
      );

      const currentLine =
        lines[lines.length - 1];

      if (
        currentLine.trim().startsWith("- ")
      ) {
        e.preventDefault();

        const newValue =
          value.slice(0, start) +
          "\n- " +
          value.slice(start);

        setValue(name, newValue as any, {
          shouldDirty: true,
        });

        requestAnimationFrame(() => {
          textarea.focus();

          const cursor = start + 3;

          textarea.setSelectionRange(
            cursor,
            cursor
          );
        });
      }
    }
  };

  const { ref, ...rest } = register(name);

  return (
    <div className="space-y-3">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-black uppercase tracking-[0.22em] text-zinc-500">
          {label}
        </label>

        <button
          type="button"
          onClick={insertTemplate}
          className="flex items-center gap-1 rounded-full bg-[#006044]/10 px-3 py-1.5 text-[10px] font-black text-[#006044] transition-all hover:bg-[#006044]/15"
        >
          <Sparkles size={12} />
          TEMPLATE
        </button>
      </div>

      {/* WRAPPER */}
      <div className="overflow-hidden rounded-[28px] border border-zinc-200 bg-white shadow-sm">

        {/* TOOLBAR */}
        <div className="flex items-center gap-2 border-b border-zinc-100 bg-zinc-50 px-3 py-2">

          <button
            type="button"
            onClick={() =>
              insertText("**", "**")
            }
            className="flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-bold text-zinc-600 transition-all hover:bg-white hover:text-black"
          >
            <Bold size={14} />
            Bold
          </button>

          <button
            type="button"
            onClick={convertToBullets}
            className="flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-bold text-zinc-600 transition-all hover:bg-white hover:text-black"
          >
            <List size={14} />
            Bullets
          </button>

          <button
            type="button"
            onClick={makeParagraph}
            className="flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-bold text-zinc-600 transition-all hover:bg-white hover:text-black"
          >
            <Type size={14} />
            Paragraph
          </button>

          <div className="ml-auto flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
            <Eye size={12} />
            Preview
          </div>
        </div>

        {/* CONTENT */}
        <div className="grid grid-cols-1 divide-y lg:grid-cols-2 lg:divide-x lg:divide-y-0">

          {/* INPUT */}
          <div className="p-4">
            <textarea
              {...rest}
              ref={(e) => {
                ref(e);
                textareaRef.current = e;
              }}
              rows={10}
              value={value || ""}
              onChange={(e) => {
                setValue(name, e.target.value as any, {
                  shouldDirty: true,
                  shouldTouch: true,
                  shouldValidate: true,
                });
              }}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="min-h-[240px] w-full resize-none bg-transparent text-sm font-medium leading-7 text-zinc-700 outline-none placeholder:text-zinc-300"
            />

            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-zinc-100 px-2 py-1 text-[10px] font-bold text-zinc-500">
                Use - for bullets
              </span>

              <span className="rounded-full bg-zinc-100 px-2 py-1 text-[10px] font-bold text-zinc-500">
                Use **text** for bold
              </span>
            </div>
          </div>

          {/* PREVIEW */}
          <div className="bg-zinc-50/60 p-5">
            <div className="mb-4 flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500" />

              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-500">
                Live Preview
              </p>
            </div>

            <div
              className="prose prose-sm max-w-none text-zinc-700"
              dangerouslySetInnerHTML={{
                __html:
                  previewHtml ||
                  `<p class="text-zinc-400">Preview appears here...</p>`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export function ProductExtraDetails() {
  const { register, control } =
    useFormContext<ProductFormValues>();

  const {
    fields: attrFields,
    append: appendAttr,
    remove: removeAttr,
  } = useFieldArray({
    control,
    name: "attributes",
  });

  const {
    fields: careFields,
    append: appendCare,
    remove: removeCare,
  } = useFieldArray({
    control,
    name: "careInstructions",
  });

  const {
    fields: deliveryFields,
    append: appendDelivery,
    remove: removeDelivery,
  } = useFieldArray({
    control,
    name: "deliveryInfo",
  });

  return (
    <div className="space-y-6">

      {/* EXTRA DETAILS */}
      <div className="overflow-hidden rounded-[32px] border border-zinc-200 bg-gradient-to-b from-white to-zinc-50 shadow-sm">

        <div className="border-b border-zinc-100 px-6 py-5">
          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#006044]/10">
              <ShieldAlert
                size={20}
                className="text-[#006044]"
              />
            </div>

            <div>
              <h2 className="text-lg font-black text-zinc-900">
                Product Extra Details
              </h2>

              <p className="text-sm text-zinc-500">
                Add ingredients, directions,
                disclaimers and specifications.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6 p-6">

          {/* TOP INPUTS */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-500">
                Manufacturer
              </label>

              <input
                {...register("extra.manufacturer")}
                placeholder="e.g. AE Naturals"
                className="h-12 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-sm font-semibold outline-none transition-all focus:border-[#006044] focus:ring-4 focus:ring-[#006044]/10"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-500">
                Country Of Origin
              </label>

              <input
                {...register("extra.countryOfOrigin")}
                placeholder="e.g. India"
                className="h-12 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-sm font-semibold outline-none transition-all focus:border-[#006044] focus:ring-4 focus:ring-[#006044]/10"
              />
            </div>
          </div>

          {/* EDITORS */}
          <SmartEditor
            name="ingredients"
            label="Ingredients"
            placeholder={`- Aloe Vera\n- Neem\n- Turmeric\n\nUse **bold** for highlights`}
          />

          <SmartEditor
            name="extra.directions"
            label="Directions To Use"
            placeholder={`- Apply gently\n- Use twice daily`}
          />

          <SmartEditor
            name="extra.safetyInfo"
            label="Safety Information"
            placeholder={`- For external use only\n- Avoid eye contact`}
          />

          <SmartEditor
            name="extra.legalDisclaimer"
            label="Legal Disclaimer"
            placeholder={`- Results may vary`}
          />
        </div>
      </div>

      {/* TECH SPECS */}
      <div className="rounded-[32px] border border-zinc-200 bg-white p-6 shadow-sm">

        <div className="mb-5 flex items-center justify-between">

          <div>
            <h3 className="text-lg font-black text-zinc-900">
              Technical Specifications
            </h3>

            <p className="text-sm text-zinc-500">
              Add key-value specifications.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              appendAttr({
                name: "",
                value: "",
              })
            }
            className="rounded-2xl bg-[#006044] px-4 py-2 text-xs font-black text-white transition-all hover:scale-[1.02]"
          >
            + ADD SPEC
          </button>
        </div>

        <div className="space-y-3">
          {attrFields.map((field, index) => (
            <div
              key={field.id}
              className="grid grid-cols-[1fr_1fr_auto] items-center gap-2 rounded-2xl border border-zinc-200 bg-zinc-50 p-2"
            >
              <input
                {...register(
                  `attributes.${index}.name`
                )}
                placeholder="Key"
                className="h-11 rounded-xl bg-white px-3 text-sm font-bold outline-none"
              />

              <input
                {...register(
                  `attributes.${index}.value`
                )}
                placeholder="Value"
                className="h-11 rounded-xl bg-white px-3 text-sm font-semibold outline-none"
              />

              <button
                type="button"
                onClick={() => removeAttr(index)}
                className="flex h-11 w-11 items-center justify-center rounded-xl text-zinc-400 hover:bg-rose-50 hover:text-rose-500"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* CARE + DELIVERY */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

        {/* CARE */}
        <div className="rounded-[32px] border border-zinc-200 bg-white p-6 shadow-sm">

          <div className="mb-5 flex items-center justify-between">

            <div>
              <h3 className="text-lg font-black text-zinc-900">
                Care Instructions
              </h3>

              <p className="text-sm text-zinc-500">
                Add product care notes.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                appendCare({ value: "" })
              }
              className="flex h-10 w-10 items-center justify-center rounded-2xl bg-green-100 text-green-700"
            >
              <Plus size={18} />
            </button>
          </div>

          <div className="space-y-3">
            {careFields.map((field, index) => (
              <div
                key={field.id}
                className="group flex items-center gap-2 rounded-2xl border border-zinc-200 bg-zinc-50 p-2"
              >
                <input
                  {...register(
                    `careInstructions.${index}.value`
                  )}
                  placeholder="e.g. Store in cool place"
                  className="h-11 flex-1 rounded-xl bg-white px-3 text-sm font-semibold outline-none"
                />

                <button
                  type="button"
                  onClick={() =>
                    removeCare(index)
                  }
                  className="flex h-10 w-10 items-center justify-center rounded-xl text-zinc-400 opacity-0 hover:bg-rose-50 hover:text-rose-500 group-hover:opacity-100"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* DELIVERY */}
        <div className="rounded-[32px] border border-zinc-200 bg-white p-6 shadow-sm">

          <div className="mb-5 flex items-center justify-between">

            <div>
              <h3 className="text-lg font-black text-zinc-900">
                Delivery Information
              </h3>

              <p className="text-sm text-zinc-500">
                Add delivery notes.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                appendDelivery({ value: "" })
              }
              className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-100 text-blue-700"
            >
              <Plus size={18} />
            </button>
          </div>

          <div className="space-y-3">
            {deliveryFields.map((field, index) => (
              <div
                key={field.id}
                className="group flex items-center gap-2 rounded-2xl border border-zinc-200 bg-zinc-50 p-2"
              >
                <input
                  {...register(
                    `deliveryInfo.${index}.value`
                  )}
                  placeholder="e.g. Ships in 2-3 days"
                  className="h-11 flex-1 rounded-xl bg-white px-3 text-sm font-semibold outline-none"
                />

                <button
                  type="button"
                  onClick={() =>
                    removeDelivery(index)
                  }
                  className="flex h-10 w-10 items-center justify-center rounded-xl text-zinc-400 opacity-0 hover:bg-rose-50 hover:text-rose-500 group-hover:opacity-100"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}