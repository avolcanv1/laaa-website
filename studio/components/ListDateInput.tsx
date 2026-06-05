import { TextInput, Stack, Text } from "@sanity/ui";
import { useCallback, type ChangeEvent } from "react";
import { PatchEvent, set, unset, type StringInputProps } from "sanity";

function formatListDateInput(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 4) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 4)}.${digits.slice(4)}`;
  return `${digits.slice(0, 4)}.${digits.slice(4, 6)}.${digits.slice(6)}`;
}

export function ListDateInput(props: StringInputProps) {
  const { value, onChange, readOnly, elementProps } = props;

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const next = formatListDateInput(event.currentTarget.value);
      onChange(PatchEvent.from(next ? set(next) : unset()));
    },
    [onChange],
  );

  return (
    <Stack space={2}>
      <TextInput
        {...elementProps}
        value={value ?? ""}
        onChange={handleChange}
        readOnly={readOnly}
        inputMode="numeric"
        placeholder="2026.12.31"
      />
      <Text muted size={1}>
        Obligatorio. Solo números — formato AAAA.MM.DD (ej. 2026.12.31)
      </Text>
    </Stack>
  );
}
