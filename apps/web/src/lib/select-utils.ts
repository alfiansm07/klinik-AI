export type RelationalSelectOption = {
  value: string;
  label: string;
};

export function getSelectedOptionLabel(
  options: RelationalSelectOption[],
  value: string | null | undefined,
) {
  if (!value) {
    return undefined;
  }

  return options.find((option) => option.value === value)?.label;
}

export function hasUnavailableSelectedOption(
  options: RelationalSelectOption[],
  value: string | null | undefined,
) {
  return Boolean(value) && !getSelectedOptionLabel(options, value);
}

export function getRelationalSelectTriggerLabel(
  options: RelationalSelectOption[],
  value: string | null | undefined,
  emptyLabel: string,
  noDataLabel: string,
) {
  const selectedLabel = getSelectedOptionLabel(options, value);

  if (selectedLabel) {
    return selectedLabel;
  }

  if (value) {
    return "Pilihan tersimpan tidak tersedia";
  }

  if (!options.length) {
    return noDataLabel;
  }

  return emptyLabel;
}
