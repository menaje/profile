import { config, fields, collection } from "@keystatic/core";

export default config({
  storage: { kind: "local" },
  collections: {
    blog: collection({
      label: "블로그",
      slugField: "title",
      path: "src/content/blog/*",
      format: { contentField: "content" },
      entryLayout: "content",
      schema: {
        title: fields.slug({
          name: { label: "제목" },
        }),
        description: fields.text({
          label: "설명",
          multiline: true,
          validation: { isRequired: true },
        }),
        publishedDate: fields.date({
          label: "발행일",
          validation: { isRequired: true },
        }),
        updatedDate: fields.date({
          label: "수정일",
        }),
        draft: fields.checkbox({
          label: "임시저장",
          defaultValue: false,
        }),
        tags: fields.array(fields.text({ label: "태그" }), {
          label: "태그",
          itemLabel: (props) => props.value,
        }),
        ogImage: fields.text({
          label: "OG 이미지 URL",
        }),
        content: fields.mdx({
          label: "본문",
        }),
      },
    }),
  },
});
