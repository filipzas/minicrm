
// this file is generated — do not edit it


declare module "svelte/elements" {
	export interface HTMLAttributes<T> {
		'data-sveltekit-keepfocus'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-noscroll'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-preload-code'?:
			| true
			| ''
			| 'eager'
			| 'viewport'
			| 'hover'
			| 'tap'
			| 'off'
			| undefined
			| null;
		'data-sveltekit-preload-data'?: true | '' | 'hover' | 'tap' | 'off' | undefined | null;
		'data-sveltekit-reload'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-replacestate'?: true | '' | 'off' | undefined | null;
	}
}

export {};


declare module "$app/types" {
	export interface AppTypes {
		RouteId(): "/" | "/app" | "/app/clients" | "/app/clients/[id]" | "/app/leads" | "/app/tasks" | "/login" | "/register";
		RouteParams(): {
			"/app/clients/[id]": { id: string }
		};
		LayoutParams(): {
			"/": { id?: string };
			"/app": { id?: string };
			"/app/clients": { id?: string };
			"/app/clients/[id]": { id: string };
			"/app/leads": Record<string, never>;
			"/app/tasks": Record<string, never>;
			"/login": Record<string, never>;
			"/register": Record<string, never>
		};
		Pathname(): "/" | "/app" | "/app/" | "/app/clients" | "/app/clients/" | `/app/clients/${string}` & {} | `/app/clients/${string}/` & {} | "/app/leads" | "/app/leads/" | "/app/tasks" | "/app/tasks/" | "/login" | "/login/" | "/register" | "/register/";
		ResolvedPathname(): `${"" | `/${string}`}${ReturnType<AppTypes['Pathname']>}`;
		Asset(): string & {};
	}
}