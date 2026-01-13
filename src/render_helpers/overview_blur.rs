use std::collections::HashMap;
use std::rc::Rc;

use smithay::backend::renderer::element::{Element, Id, Kind, RenderElement, UnderlyingStorage};
use smithay::backend::renderer::gles::{GlesError, GlesFrame, GlesRenderer, GlesTexture, Uniform};
use smithay::backend::renderer::utils::{CommitCounter, OpaqueRegions};
use smithay::utils::{Buffer, Logical, Physical, Rectangle, Scale, Transform};

use super::renderer::AsGlesFrame;
use super::shader_element::ShaderRenderElement;
use super::shaders::ProgramType;
use crate::backend::tty::{TtyFrame, TtyRenderer, TtyRendererError};

#[derive(Debug)]
pub struct OverviewBlurRenderElement(ShaderRenderElement);

impl OverviewBlurRenderElement {
    pub fn new(
        area: Rectangle<f64, Logical>,
        texture: GlesTexture,
        blur_radius: f32,
        scale: f32,
        alpha: f32,
    ) -> Self {
        Self(
            ShaderRenderElement::new(
                ProgramType::OverviewBlur,
                area.size,
                None,
                scale,
                alpha,
                Rc::new([Uniform::new("blur_radius", blur_radius)]),
                HashMap::from([(String::from("niri_tex"), texture)]),
                Kind::Unspecified,
            )
            .with_location(area.loc),
        )
    }
}

impl Element for OverviewBlurRenderElement {
    fn id(&self) -> &Id {
        self.0.id()
    }

    fn current_commit(&self) -> CommitCounter {
        self.0.current_commit()
    }

    fn geometry(&self, scale: Scale<f64>) -> Rectangle<i32, Physical> {
        self.0.geometry(scale)
    }

    fn transform(&self) -> Transform {
        self.0.transform()
    }

    fn src(&self) -> Rectangle<f64, Buffer> {
        self.0.src()
    }

    fn damage_since(
        &self,
        scale: Scale<f64>,
        commit: Option<CommitCounter>,
    ) -> smithay::backend::renderer::utils::DamageSet<i32, Physical> {
        self.0.damage_since(scale, commit)
    }

    fn opaque_regions(&self, scale: Scale<f64>) -> OpaqueRegions<i32, Physical> {
        self.0.opaque_regions(scale)
    }

    fn alpha(&self) -> f32 {
        self.0.alpha()
    }

    fn kind(&self) -> Kind {
        self.0.kind()
    }
}

impl RenderElement<GlesRenderer> for OverviewBlurRenderElement {
    fn draw(
        &self,
        frame: &mut GlesFrame<'_, '_>,
        src: Rectangle<f64, Buffer>,
        dst: Rectangle<i32, Physical>,
        damage: &[Rectangle<i32, Physical>],
        opaque_regions: &[Rectangle<i32, Physical>],
    ) -> Result<(), GlesError> {
        let frame = frame.as_gles_frame();
        RenderElement::<GlesRenderer>::draw(&self.0, frame, src, dst, damage, opaque_regions)
    }

    fn underlying_storage(&self, renderer: &mut GlesRenderer) -> Option<UnderlyingStorage<'_>> {
        self.0.underlying_storage(renderer)
    }
}

impl<'render> RenderElement<TtyRenderer<'render>> for OverviewBlurRenderElement {
    fn draw(
        &self,
        frame: &mut TtyFrame<'render, '_, '_>,
        src: Rectangle<f64, Buffer>,
        dst: Rectangle<i32, Physical>,
        damage: &[Rectangle<i32, Physical>],
        opaque_regions: &[Rectangle<i32, Physical>],
    ) -> Result<(), TtyRendererError<'render>> {
        let frame = frame.as_gles_frame();
        RenderElement::<GlesRenderer>::draw(&self.0, frame, src, dst, damage, opaque_regions)?;
        Ok(())
    }

    fn underlying_storage(
        &self,
        renderer: &mut TtyRenderer<'render>,
    ) -> Option<UnderlyingStorage<'_>> {
        self.0.underlying_storage(renderer)
    }
}
