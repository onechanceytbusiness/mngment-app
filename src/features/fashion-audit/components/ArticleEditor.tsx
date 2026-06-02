import { useEffect, useRef } from 'react';
import { useEditor, EditorContent, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  Image as ImageIcon,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import type { Article } from '@/lib/types';

export interface ArticleEditorProps {
  article: Article;
  onChange: (article: Article) => void;
}

const proseClass = cn(
  'max-w-none leading-relaxed text-stone-800 focus:outline-none',
  '[&_h1]:text-3xl [&_h1]:font-semibold [&_h1]:mt-6 [&_h1]:mb-3',
  '[&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:mt-6 [&_h2]:mb-3 [&_h2]:text-stone-900',
  '[&_h3]:text-xl [&_h3]:font-semibold [&_h3]:mt-5 [&_h3]:mb-2 [&_h3]:text-stone-900',
  '[&_p]:my-3 [&_p]:text-base [&_p]:text-stone-700',
  '[&_blockquote]:border-l-4 [&_blockquote]:border-stone-300 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-stone-600 [&_blockquote]:my-4',
  '[&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-3 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-3',
  '[&_li]:my-1',
  '[&_a]:text-brand-600 [&_a]:underline',
  '[&_img]:rounded-lg [&_img]:my-4 [&_img]:max-w-full',
);

function ToolbarButton({
  active,
  onClick,
  children,
  title,
}: {
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
  title: string;
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      title={title}
      className={cn(
        'inline-flex h-8 w-8 items-center justify-center rounded-md text-stone-600 transition-colors hover:bg-stone-100',
        active && 'bg-stone-200 text-stone-900',
      )}
    >
      {children}
    </button>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleLink = () => {
    const previous = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt('Link URL', previous ?? 'https://');
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const handlePickImage = () => {
    fileInputRef.current?.click();
  };

  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const src = reader.result as string;
      editor.chain().focus().setImage({ src }).run();
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-stone-200 bg-stone-50 px-2 py-1.5">
      <ToolbarButton
        title="Bold"
        active={editor.isActive('bold')}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <Bold className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        title="Italic"
        active={editor.isActive('italic')}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <Italic className="h-4 w-4" />
      </ToolbarButton>
      <div className="mx-1 h-5 w-px bg-stone-200" />
      <ToolbarButton
        title="Heading 2"
        active={editor.isActive('heading', { level: 2 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        <Heading2 className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        title="Heading 3"
        active={editor.isActive('heading', { level: 3 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      >
        <Heading3 className="h-4 w-4" />
      </ToolbarButton>
      <div className="mx-1 h-5 w-px bg-stone-200" />
      <ToolbarButton
        title="Bullet list"
        active={editor.isActive('bulletList')}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <List className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        title="Ordered list"
        active={editor.isActive('orderedList')}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <ListOrdered className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        title="Blockquote"
        active={editor.isActive('blockquote')}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        <Quote className="h-4 w-4" />
      </ToolbarButton>
      <div className="mx-1 h-5 w-px bg-stone-200" />
      <ToolbarButton
        title="Link"
        active={editor.isActive('link')}
        onClick={handleLink}
      >
        <LinkIcon className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton title="Image" onClick={handlePickImage}>
        <ImageIcon className="h-4 w-4" />
      </ToolbarButton>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageFile}
      />
    </div>
  );
}

export function ArticleEditor({ article, onChange }: ArticleEditorProps) {
  const articleRef = useRef(article);
  articleRef.current = article;

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link.configure({ openOnClick: false, autolink: true }),
    ],
    content: article.content_html,
    editorProps: {
      attributes: {
        class: cn(proseClass, 'min-h-[420px] px-4 py-4'),
      },
    },
    onUpdate: ({ editor: ed }) => {
      onChange({ ...articleRef.current, content_html: ed.getHTML() });
    },
  });

  useEffect(() => {
    if (!editor) return;
    if (article.content_html !== editor.getHTML()) {
      editor.commands.setContent(article.content_html, false);
    }
  }, [article.content_html, editor]);

  return (
    <div className="flex flex-col gap-4">
      <input
        value={article.title}
        onChange={(e) => onChange({ ...article, title: e.target.value })}
        placeholder="Untitled article"
        className="w-full border-0 bg-transparent px-1 text-3xl font-semibold text-stone-900 placeholder:text-stone-300 focus:outline-none focus:ring-0"
      />

      <div className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-soft">
        {editor ? <Toolbar editor={editor} /> : null}
        <EditorContent editor={editor} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="article-excerpt"
          className="text-sm font-medium text-stone-700"
        >
          Excerpt
        </label>
        <textarea
          id="article-excerpt"
          rows={3}
          value={article.excerpt}
          onChange={(e) => onChange({ ...article, excerpt: e.target.value })}
          className="w-full rounded-lg border border-stone-200 bg-white p-3 text-sm text-stone-800 shadow-soft focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
        />
      </div>
    </div>
  );
}

export default ArticleEditor;
