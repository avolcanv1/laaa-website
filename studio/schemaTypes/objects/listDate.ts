import { defineType } from "sanity";

import { ListDateInput } from "../../components/ListDateInput";
import { validateListDate } from "../../lib/listDateValidation";

export default defineType({
  name: "listDate",
  title: "Fecha",
  type: "string",
  description: "Obligatorio. Solo números, formato 2026.12.31",
  components: {
    input: ListDateInput,
  },
  validation: (rule) =>
    rule.required().custom((value) => validateListDate(value as string | undefined)),
});
