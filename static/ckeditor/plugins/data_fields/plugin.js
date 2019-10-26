CKEDITOR.plugins.add('data_fields',{
  requires: 'widget,contextmenu',
  init:function(editor) {
    var config = editor.config;
    var pluginName = 'data_fields'; //控件名称
    editor.addCommand(pluginName, new CKEDITOR.dialogCommand(pluginName+'_dialog')); //给编辑器注册一个打开弹出窗命令
    CKEDITOR.document.appendStyleSheet(this.path+'style.css');
    editor.ui.addButton(pluginName, {  //在工具栏上增加一个按钮，绑定按钮事件
      label: '数据字段',
      command: pluginName,
    });

    createPluginContextMenu(pluginName,editor);
    createPluginDialog(pluginName,editor);
    createPluginWidget(pluginName,editor);
    createMenuCommand(pluginName,editor);

    function createPluginContextMenu(pluginName,editor){

      if (editor.contextMenu ) {
        //为文本框加右键属性菜单
        editor.addMenuGroup( 'data_fields');
        editor.addMenuItems({
          data_field: {
            label: '数据字段',
            command: pluginName,
            group: 'data_fields',
            order:0
          },
          data_field_list:{
            label: '数据循环',
            group: 'data_fields',
            order:1,
            getItems:function(){
              let items = {
                data_list_cancel:CKEDITOR.TRISTATE_OFF,
              };
              let selection = editor.getSelection().getCommonAncestor();
              window.test = selection;
              let parent = selection.getAscendant({tr:1,table:1,div:1,p:1},true);
              if (parent) {
                if(parent.hasAttribute('data-list')){
                  if(config && config.data_fields && config.data_fields.data){
                    config.data_fields.data.forEach(function(item,index){
                      items['data_list_create_'+item.section] = CKEDITOR.TRISTATE_DISABLED;
                    })
                  }
                  items.data_list_create = CKEDITOR.TRISTATE_DISABLED;
                }else {
                  if(config && config.data_fields && config.data_fields.data){
                    config.data_fields.data.forEach(function(item,index){
                      items['data_list_create_'+item.section] = CKEDITOR.TRISTATE_OFF;
                    })
                  }
                  items.data_list_cancel =  CKEDITOR.TRISTATE_DISABLED;
                }
              }else{
                items.data_list_cancel = CKEDITOR.TRISTATE_DISABLED;
              }
              return items;
            }

          },
          data_list_cancel:{
            label: '取消循环',
            command: pluginName+'_list_cancel',
            group: 'data_fields',
            order:12
          },

        });
        if(config && config.data_fields && config.data_fields.data){
          config.data_fields.data.forEach(function(item,index){
            editor.addMenuItem('data_list_create_'+item.section,
              {
                label: '创建'+item.name+'循环',
                onClick:function(){
                  editor.execCommand(pluginName+'_list_create',{section:item.section,name:item.name})
                },
                order:12,
                group:'data_fields'
              },
            );
          });
        }

        //右键菜单的监听器，判断是否显示菜单
        editor.contextMenu.addListener(function (element) {
          return {data_field: CKEDITOR.TRISTATE_OFF,data_field_list:CKEDITOR.TRISTATE_OFF};
        });
        window.test = editor;
      }
    }
    function createMenuCommand(pluginName,editor){
      editor.addCommand( pluginName+'_list_create', {
        exec: function( editor,data ) {
          let selection = editor.getSelection().getCommonAncestor();
          let parent = selection.getAscendant({tr:1,table:1,div:1,p:1},true);
          if ( !parent )
            return;
          parent.setAttribute('data-list',data.section);
          parent.addClass('data-list');
        }});
      editor.addCommand( pluginName+'_list_cancel', {
        exec: function( editor ) {
          let selection = editor.getSelection().getCommonAncestor();
          let parent = selection.getAscendant({tr:1,table:1,div:1,p:1},true);
          if ( !parent )
            return;
          parent.removeClass('data-list');
          parent.removeAttribute('data-list');
        }});
    }
    function createPluginWidget(pluginName,editor){
      editor.widgets.add( pluginName, {
        template:
          '<span class="datafield">{}</span>',
        dialog: pluginName+'_dialog',
        pathName:'字段',
        inline:true,
        allowedContent:'span[data-field,data-section,data-title](datafield)',
        upcast: function( element ) {
          return element.name == 'span' && element.hasClass( 'datafield' );
        },

        init: function() {
          var field = this.element.getAttribute('data-field');
          var title = this.element.getAttribute('data-title');
          var section = this.element.getAttribute('data-section');
          var section_name = this.element.getAttribute('data-section-name');
          if ( field )
            this.setData( 'field', field );
          if (title)
            this.setData( 'title', title );
          if (section)
            this.setData( 'section', section );
          if (section_name)
            this.setData( 'section_name', section_name );

        },

        data: function() {
          if(!this.data.title){
            this.element.setText('');
            this.element.removeAttribute('data-title');
          }else{
            this.element.setText('{'+this.data.section_name+'.'+this.data.title+'}');
            this.element.setAttribute('data-title',this.data.title);
          }

          if(!this.data.field){
            this.element.removeAttribute('data-field');
          }else{
            this.element.setAttribute('data-field',this.data.field);
          }

          if(!this.data.section){
            this.element.removeAttribute('data-section');
          }else{
            this.element.setAttribute('data-section',this.data.section);
          }
          if(!this.data.section_name){
            this.element.removeAttribute('data-section-name');
          }else{
            this.element.setAttribute('data-section-name',this.data.section_name);
          }

        }
      });
    }
    function createPluginDialog(pluginName,editor){
      let dialogConfig = {
        title: '数据字段',
        minWidth: 400,
        minHeight: 200,
        //弹出窗上显示的内容
        contents: [
          {
            id: 'tab1',
            label: '',
            title: '',
            elements: [
              {
                type: 'html',
                id:'data_fields_sections_container',
                html: '<div id="data_fields_sections_container" style="max-height: 500px"></div>',
                commit:function(widget,dom){
                  const fieldTags = this.getDialog().getElement().getDocument().getById('data_fields_sections_container').find('.field-tag').toArray();
                  fieldTags.forEach(function(item,index){
                    if(item.hasClass('selected')){
                      widget.setData({section:item.getAttribute('data-section'),section_name:item.getAttribute('data-section-name'),field:item.getAttribute('data-field'),title:item.getAttribute('data-title')});
                    }
                  });


                },
                setup:function(widget){
                  setTimeout(()=>{
                    var fieldTags = this.getDialog().getElement().getDocument().getById('data_fields_sections_container').find('.field-tag').toArray();
                    if(widget && widget.data.section && widget.data.field && widget.data.title ){
                      fieldTags.forEach(function(item,index){
                        if(item.getAttribute('data-field') == widget.data.field && item.getAttribute('data-section') == widget.data.section){
                          item.addClass('selected');
                        }else{
                          item.removeClass('selected');
                        }
                      })
                    }else{
                      fieldTags[0].addClass('selected');
                    }
                  });

                }
              }
            ]
          }
        ],

        initFieldsDom(dialog){
          let data = config.data_fields? config.data_fields.data ?  config.data_fields.data:[]:[];
          let sectionHTML = '';

          for(let i = 0;i<data.length;i++){
            sectionHTML += "<div id='sections' class='sections'><div class='section-panel'><div class='section-panel-title' >"+data[i]['name']+"</div><div class='section-panel-body'>";
            let fieldsHTML = '';
            for(let j = 0;j<data[i]['fields'].length;j++){
              fieldsHTML+= "<div class='field-tag' data-title='"+data[i]['fields'][j]['title']+"'  data-field='"+data[i]['fields'][j]['field']+"' data-section='"+data[i]['section']+"' data-section-name='"+data[i]['name']+"' >"+data[i]['fields'][j]['title']+"</div>"
            }
            sectionHTML+=fieldsHTML+'</div></div></div>';

          }
          const contentNode = dialog.getElement().getDocument().getById('data_fields_sections_container');
          contentNode.appendHtml(sectionHTML)
          const fieldTags = contentNode.find('.field-tag').toArray();

          fieldTags.forEach(function(item,index){
            item.on('click',function(event){
              fieldTags.forEach(function(item1,index1){
                item1.removeClass('selected');
              });

              event.data.getTarget().addClass('selected');
              if ( dialog.fire( 'ok', { hide: true } ).hide !== false )
                dialog.hide();
            })
          })
        },
        onLoad:function(){
          this.definition.initFieldsDom(this);
        },
        //弹出窗显示事件
        onShow: function() {
          this.setupContent();
          const contentNode = this.getElement().getDocument().getById('data_fields_sections_container');
          const fieldTags = contentNode.find('.field-tag').toArray();
          fieldTags.forEach(function(item1,index1){
            item1.removeClass('selected');
          });
        },
        //弹出窗确定按钮事件
        onOk: function() {
        }
      };
      CKEDITOR.dialog.add( pluginName+'_dialog',function(editor){return dialogConfig});
    }
  }
});
