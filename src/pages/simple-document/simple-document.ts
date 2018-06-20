import { Component, ComponentFactory, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { OpenHomePage } from '../open-home';
import { DataService } from '../../app/data.service';

@Component({
  selector: 'page-simple-document',
  templateUrl: 'simple-document.html',
})
export class SimpleDocumentPage extends OpenHomePage implements OnInit {
  simpleDocumentFileName: string;
  // content$: Observable<SafeHtml>;
  navBarTitle: string;

  @ViewChild('container', { read: ViewContainerRef }) container: ViewContainerRef;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public dataService: DataService,
    // private sanitizer: DomSanitizer,
  ) {
    super(navCtrl);
    this.simpleDocumentFileName = this.navParams.get('simpleDocumentFileName');
    // this.content$ = dataService.getSimpleDocumentByFileName(simpleDocumentFileName)
    //   .pipe(map((content) => this.sanitizer.bypassSecurityTrustHtml(content)));
    this.navBarTitle = this.simpleDocumentFileName;
  }

  ngOnInit() {
    this.dataService.getSimpleDocumentComponentFactoryByFileName(this.simpleDocumentFileName).subscribe((componentFactory) => {
      this.addComponent(componentFactory);
    });
  }

  // Création dynamique de template grâce à https://stackoverflow.com/a/39507831/535203
  private addComponent(componentFactory: ComponentFactory<any>, properties: any = {}) {
    const component = this.container.createComponent(componentFactory);
    Object.assign(component.instance, properties);
    // If properties are changed at a later stage, the change detection
    // may need to be triggered manually:
    // component.changeDetectorRef.detectChanges();
  }
}
