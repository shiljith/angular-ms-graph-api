import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { MsalService } from '@azure/msal-angular';
import { InteractionType } from '@azure/msal-browser';
import { protectedResources } from '../auth-config';
import { GraphService, ProviderOptions } from '../graph.service';

const GRAPH_URL = 'https://graph.microsoft.com/v1.0';

@Component({
  selector: 'app-one-drive',
  templateUrl: './one-drive.component.html',
  styleUrls: ['one-drive.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class OneDriveComponent implements OnInit {
  oneDrive: any;
  oneDriveCollection: any;
  folderName: string = '';
  public hierarchicalData: Object[] = [
    {
      nodeId: '01',
      nodeText: 'Music',
      icon: 'folder',
      nodeChild: [{ nodeId: '01-01', nodeText: 'Gouttes.mp3', icon: 'audio' }],
    },
    {
      nodeId: '02',
      nodeText: 'Videos',
      icon: 'folder',
      nodeChild: [
        { nodeId: '02-01', nodeText: 'Naturals.mp4', icon: 'video' },
        { nodeId: '02-02', nodeText: 'Wild.mpeg', icon: 'video' },
      ],
    },
    {
      nodeId: '03',
      nodeText: 'Documents',
      icon: 'folder',
      nodeChild: [
        {
          nodeId: '03-01',
          nodeText: 'Environment Pollution.docx',
          icon: 'docx',
        },
        {
          nodeId: '03-02',
          nodeText: 'Global Water, Sanitation, & Hygiene.docx',
          icon: 'docx',
        },
        { nodeId: '03-03', nodeText: 'Global Warming.ppt', icon: 'ppt' },
        { nodeId: '03-04', nodeText: 'Social Network.pdf', icon: 'pdf' },
        { nodeId: '03-05', nodeText: 'Youth Empowerment.pdf', icon: 'pdf' },
      ],
    },
    {
      nodeId: '04',
      nodeText: 'Pictures',
      icon: 'folder',
      expanded: true,
      nodeChild: [
        {
          nodeId: '04-01',
          nodeText: 'Camera Roll',
          icon: 'folder',
          expanded: true,
          nodeChild: [
            {
              nodeId: '04-01-01',
              nodeText: 'WIN_20160726_094117.JPG',
              image:
                'https://ej2.syncfusion.com/demos/src/images/employees/9.png',
            },
            {
              nodeId: '04-01-02',
              nodeText: 'WIN_20160726_094118.JPG',
              image:
                'https://ej2.syncfusion.com/demos/src/images/employees/3.png',
            },
          ],
        },
        { nodeId: '04-02', nodeText: 'Wind.jpg', icon: 'images' },
        { nodeId: '04-03', nodeText: 'Stone.jpg', icon: 'images' },
      ],
    },
    {
      nodeId: '05',
      nodeText: 'Downloads',
      icon: 'folder',
      nodeChild: [
        { nodeId: '05-01', nodeText: 'UI-Guide.pdf', icon: 'pdf' },
        { nodeId: '05-02', nodeText: 'Tutorials.zip', icon: 'zip' },
        { nodeId: '05-03', nodeText: 'Game.exe', icon: 'exe' },
        { nodeId: '05-04', nodeText: 'TypeScript.7z', icon: 'zip' },
      ],
    },
  ];
  public field: any;
  displayUrl: string = '';

  path: string = 'root';
  breadcrumb = [{ name: 'MyFile', path: 'root' }];

  itemName: string = '';
  itemBody: string = '';
  selectedFiles!: any;
  loader: boolean = false;
  selectedItem!: any;

  constructor(
    private graphService: GraphService,
    private authService: MsalService,
    private http: HttpClient,
    public sanitizer: DomSanitizer,
    private router: Router
  ) {}

  ngOnInit(): void {
    const providerOptions: ProviderOptions = {
      account: this.authService.instance.getActiveAccount()!,
      scopes: protectedResources.graphMe.scopes,
      interactionType: InteractionType.Popup,
    };

    this.getDrive(providerOptions);
    this.getDriveCollection();
  }

  getDriveCollection() {
    this.loader = true;
    this.http
      .get(`${GRAPH_URL}/me/drive/${this.path}/children`)
      .subscribe((res: any) => {
        this.oneDriveCollection = res.value;
        this.loader = false;
        //console.log(this.oneDriveCollection[0]);
      });
  }

  onSelected(item: any) {
    this.selectedItem = item;
  }

  onClick(item: any) {
    this.path = `items/${item.id}`;
    if (item.file) {
      this.http
        .post(`${GRAPH_URL}/me/drive/${this.path}/createLink`, {
          type: 'edit',
          scope: 'anonymous',
        })
        .subscribe(
          (res: any) => {
            console.log(res);
            this.displayUrl = res.link.webUrl;
            console.log(this.displayUrl);
            // this.router.navigate([]).then((result) => {
            //   window.open(this.displayUrl, '_blank');
            // });
          },
          (err) => {
            console.log(err.url);
            this.displayUrl = err.url;
          }
        );
      return;
    }

    this.getDriveCollection();
  }

  goBack(bread: any) {
    this.displayUrl = '';
    this.path = 'root';
    this.getDriveCollection();
  }

  createNewFolder() {
    const body = {
      name: this.itemName,
      folder: {},
      '@microsoft.graph.conflictBehavior': 'rename',
    };
    this.http
      .post(`${GRAPH_URL}/me/drive/${this.path}/children`, body)
      .subscribe((res) => {
        console.log(res);
        this.getDriveCollection();
        this.itemName = '';
      });
  }

  selectFile(event: any) {
    this.selectedFiles = event.target.files;
  }

  uploadFile() {
    const currentFile = this.selectedFiles.item(0);
    console.log(currentFile);
    currentFile.arrayBuffer().then((buffer: any) => {
      let body = new Uint8Array(buffer);
      let uIntBody = body.buffer;
      console.log(uIntBody);
      this.http
        .put(
          `${GRAPH_URL}/me/drive/${this.path}:/${currentFile.name}:/content`,
          uIntBody,
          {
            headers: {},
          }
        )
        .subscribe((res) => {
          console.log(res);
          this.getDriveCollection();
        });
    });
  }

  createNewFile() {
    const body = {
      name: 'contoso plan (copy).txt',
    };
    const stream = 'The contents of the file goes here.';
    this.http
      .post(`${GRAPH_URL}/me/drive/root:/CTS-Ford/abc.txt:/content`, stream, {
        headers: {
          'Content-Type':
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        },
      })
      .subscribe((res) => {
        console.log(res);
        this.thumbNail = res;
        this.folderName = '';
      });
  }

  //////
  getFileType(type: string) {
    const value = type.split('/')[1];
    let result = '';
    switch (value) {
      case 'pdf':
        result = 'pdf';
        break;
      case 'vnd.openxmlformats-officedocument.wordprocessingml.document':
        result = 'docx';
        break;
    }
  }
  getDrive(providerOptions: ProviderOptions) {
    this.graphService
      .getGraphClient(providerOptions)
      .api('/me/drive')
      .get()
      .then((res: any) => {
        //console.log(res);
        this.oneDrive = res;
      })
      .catch((error) => {
        //console.log(error);
      });
  }

  getSanitize(url: string) {
    const sUrl: any = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    console.log(sUrl);
    return sUrl;
  }

  createFolder() {
    const body = {
      name: this.folderName,
      folder: {},
    };
    this.http
      .post(`${GRAPH_URL}/me/drive/root/children`, body)
      .subscribe((res) => {
        console.log(res);
        this.getDriveCollection();
        this.folderName = '';
      });
  }
  thumbNail: any;
  createFile() {
    const body = {
      name: 'contoso plan (copy).txt',
    };
    const stream = 'The contents of the file goes here.';
    this.http
      //.get(`${GRAPH_URL}/me/drive/root:/CTS-Ford:/children`, body)
      //.get(`${GRAPH_URL}/me/drive/root:/CTS-Ford:/children`)
      //.get(`${GRAPH_URL}/me/drive/items/26DC0CB239868B16!3741/preview`)
      // .get(
      //   `${GRAPH_URL}/drives/26dc0cb239868b16/items/26DC0CB239868B16!3741/analytics`
      // )
      .post(`${GRAPH_URL}/me/drive/root:/CTS-Ford/abc.txt:/content`, stream, {
        headers: {
          'Content-Type':
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        },
      })
      .subscribe((res) => {
        console.log(res);
        this.thumbNail = res;
        this.folderName = '';
      });
  }
}
