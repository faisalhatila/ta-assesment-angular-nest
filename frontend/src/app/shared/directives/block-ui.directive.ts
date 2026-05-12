import {
  Directive,
  ElementRef,
  inject,
  Input,
  OnChanges,
  Renderer2,
  SimpleChanges,
} from '@angular/core';

/**
 * When active, covers the host with a dimmed layer and a centered spinner (mobile-friendly).
 */
@Directive({
  selector: '[appBlockUi]',
  standalone: true,
})
export class BlockUiDirective implements OnChanges {
  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly renderer = inject(Renderer2);
  private layer: HTMLElement | null = null;

  @Input({ alias: 'appBlockUi', required: true }) active!: boolean;

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['active']) return;
    if (this.active) {
      this.attach();
    } else {
      this.detach();
    }
  }

  private attach(): void {
    if (this.layer) return;
    const host = this.el.nativeElement;
    const position = getComputedStyle(host).position;
    if (position === 'static') {
      this.renderer.setStyle(host, 'position', 'relative');
    }

    const layer = this.renderer.createElement('div');
    this.renderer.setStyle(layer, 'position', 'absolute');
    this.renderer.setStyle(layer, 'inset', '0');
    this.renderer.setStyle(layer, 'z-index', '3');
    this.renderer.setStyle(layer, 'display', 'grid');
    this.renderer.setStyle(layer, 'place-items', 'center');
    this.renderer.setStyle(layer, 'background', 'rgba(255,255,255,0.65)');
    this.renderer.setStyle(layer, 'backdrop-filter', 'blur(2px)');
    this.renderer.setAttribute(layer, 'role', 'progressbar');
    this.renderer.setAttribute(layer, 'aria-busy', 'true');

    const spinner = this.renderer.createElement('div');
    this.renderer.addClass(spinner, 'cc-block-ui-spinner');
    this.renderer.appendChild(layer, spinner);
    this.renderer.appendChild(host, layer);
    this.layer = layer;
  }

  private detach(): void {
    if (!this.layer) return;
    this.renderer.removeChild(this.el.nativeElement, this.layer);
    this.layer = null;
  }
}
